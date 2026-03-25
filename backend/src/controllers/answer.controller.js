const pool = require("../config/db");

const { sendNewAnswerEmail, sendAnswerAcceptedEmail } = require("../services/email.service"); 

// voteValue expected: 1 or -1
exports.voteAnswer = async (req, res) => {
  const answerId = req.params.id;
  const userId = req.user.userId;
  const { value } = req.body;

  if (![1, -1].includes(Number(value))) {
    return res.status(400).json({ error: "Value must be 1 or -1" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ensure answer exists
    const aRes = await client.query("SELECT id FROM answers WHERE id = $1", [answerId]);
    if (aRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Answer not found" });
    }

    // upsert vote (replace existing or insert)
    const existing = await client.query(
      "SELECT value FROM votes WHERE user_id = $1 AND answer_id = $2",
      [userId, answerId]
    );

    if (existing.rows.length === 0) {
      await client.query(
        "INSERT INTO votes (user_id, answer_id, value) VALUES ($1, $2, $3)",
        [userId, answerId, value]
      );
    } else {
      if (existing.rows[0].value === Number(value)) {
        // same vote => remove (toggle off)
        await client.query("DELETE FROM votes WHERE user_id = $1 AND answer_id = $2", [userId, answerId]);
      } else {
        // update to new value
        await client.query("UPDATE votes SET value = $1 WHERE user_id = $2 AND answer_id = $3", [value, userId, answerId]);
      }
    }

    await client.query("COMMIT");
    return res.json({ message: "Vote recorded" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("voteAnswer:", err);
    return res.status(500).json({ error: "Failed to vote" });
  } finally {
    client.release();
  }
};

exports.acceptAnswer = async (req, res) => {
  const answerId = req.params.id;
  const userId = req.user.userId;

  const { updateUserTitle } = require("../services/title.service");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Fetch answer, question, and all user info needed for emails in one query
    const ansRes = await client.query(
      `SELECT
        a.id,
        a.question_id,
        a.user_id AS answerer_id,
        q.user_id AS question_owner,
        q.title AS question_title,
        answerer.name AS answerer_name,
        answerer.email AS answerer_email,
        asker.email AS asker_email
       FROM answers a
       JOIN questions q ON a.question_id = q.id
       JOIN users answerer ON a.user_id = answerer.id
       JOIN users asker ON q.user_id = asker.id
       WHERE a.id = $1
       FOR UPDATE`,
      [answerId]
    );

    if (ansRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Answer not found" });
    }

    const {
      question_id: questionId,
      question_owner: questionOwner,
      question_title: questionTitle,
      answerer_id: answererId,
      answerer_name: answererName,
      answerer_email: answererEmail,
    } = ansRes.rows[0];

    // only question owner can accept
    if (questionOwner !== userId) {
      await client.query("ROLLBACK");
      return res.status(403).json({ error: "Only question owner can accept an answer" });
    }

    // Un-accept any previously accepted answers for this question
    await client.query("UPDATE answers SET is_accepted = false WHERE question_id = $1", [questionId]);

    // Accept the chosen answer
    await client.query("UPDATE answers SET is_accepted = true WHERE id = $1", [answerId]);

    // Update question status to 'resolved'
    await client.query("UPDATE questions SET status = 'resolved' WHERE id = $1", [questionId]);

    // Update title
    await updateUserTitle(answererId, client);

    await client.query("COMMIT");

    // Send email to answerer — fire and forget after commit
    sendAnswerAcceptedEmail(
      answererEmail,
      answererName,
      questionTitle,
      questionId
    ).catch((err) => console.error("Failed to send answer accepted email:", err));
    
    return res.json({ message: "Answer accepted" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("acceptAnswer:", err);
    return res.status(500).json({ error: "Failed to accept answer" });
  } finally {
    client.release();
  }
};
