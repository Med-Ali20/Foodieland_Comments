const express = require("express");
require("dotenv").config();
const { createComment, createInstagramComment } = require("./controller");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/meta_comments", async (req, res) => {
  try {
    const challenge = req.query["hub.challenge"];
    res.status(200).send(challenge);
  } catch (error) {
    console.log(error);
  }
});

app.post("/meta_comments", async (req, res) => {
  try {
    if (req.body.entry[0].changes[0].value.comment_id) {
      if (req.body.entry[0].changes[0].value.message.length == 0) {
        return;
      }
      const date = new Date(
        req.body.entry[0].changes[0].value.created_time * 1000
      );
      const createdAt = date.toISOString();

      const comment = {
        Comment: req.body.entry[0].changes[0].value.message,
        "Post ID": req.body.entry[0].changes[0].value.post_id,
        "Comment ID": req.body.entry[0].changes[0].value.comment_id,
        "Poster ID": req.body.entry[0].changes[0].value.from.id,
        "Poster Name": req.body.entry[0].changes[0].value.from.name,
        "Created At": createdAt,
      };

      createComment(comment);
    }
  } catch (error) {
    console.log(error);
  }
});

// Instagram Comments

app.get("/instagram_comments", async (req, res) => {
  try {
    const challenge = req.query["hub.challenge"];
    res.status(200).send(challenge);
  } catch (error) {
    console.log(error);
  }
});

app.post("/instagram_comments", async (req, res) => {
  try {
    if (
      req.body.object === "instagram" &&
      req.body.entry[0].changes[0].field === "comments"
    ) {
      if(req.body.entry[0].changes[0].value.text.length == 0) {return}
      const date = new Date(req.body.entry[0].time * 1000);
      const createdAt = date.toISOString();
      const comment = {
        Comment: req.body.entry[0].changes[0].value.text,
        "Comment ID": req.body.entry[0].changes[0].value.id,
        "Media ID": req.body.entry[0].changes[0].value.media.id,
        "Poster ID": req.body.entry[0].changes[0].value.from.id,
        "Poster Name": req.body.entry[0].changes[0].value.from.username,
        "Created At": createdAt,
      };
      createInstagramComment(comment);
    }
  } catch (error) {
    console.log("instagram webhook error", error);
  }
});

app.listen(PORT, async () => {
  console.log(`App is running on port ${PORT}`);
});
