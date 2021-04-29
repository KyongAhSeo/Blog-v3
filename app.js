//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

const homeStartingContent =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
const aboutContent =
  "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent =
  "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const postsSchema = {
  title: String,
  content: String,
  time: String,
};

//mongoose 모델명은 대문자로
//첫번째 인자인 collectionName은 단수형태로
//두번째 인자에는 schemaName
const Post = mongoose.model("Post", postsSchema);

//home page
app.get("/", function (req, res) {
  Post.find({}, function (err, foundPosts) {
    res.render("home", {
      homeStartingContent: homeStartingContent,
      posts: foundPosts,
    });
  });
});

//about page
app.get("/about", function (req, res) {
  res.render("about", { aboutContent: aboutContent });
});

//contact page
app.get("/contact", function (req, res) {
  res.render("contact", { contactContent: contactContent });
});

//write page
app.get("/write", function (req, res) {
  res.render("write");
});

//params를 이용해 라우트의 경로에 특정 값을 넣어 해당 페이지로 이동한다.
app.get("/posts/:postId", function (req, res) {
  const requestedPostId = req.params.postId;

  Post.findOne({ _id: requestedPostId }, function (err, foundPosts) {
    if (err) {
      console.log(err);
    } else {
      res.render("post", {
        title: foundPosts.title,
        time: foundPosts.time,
        content: foundPosts.content,
      });
    }
  });
});

//params를 이용해 라우트의 경로에 특정 값을 넣어 해당 페이지로 이동 -> 수정페이지
app.get("/edit/:postTitle", function (req, res) {
  const requestedPostTitle = req.params.postTitle;

  Post.findOne({ title: requestedPostTitle }, function (err, foundPosts) {
    if (err) {
      console.log(err);
    } else {
      res.render("edit", {
        title: foundPosts.title,
        time: foundPosts.time,
        content: foundPosts.content,
      });
    }
  });
});

//글 작성
//write 라우트 에서 post 요청이 들어오면 bodyParser로 받아온 값을 posts 배열에 저장하고 루트 라우트로 redirect시킴
app.post("/write", function (req, res) {
  //document 생성
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
    time: new Date().toLocaleDateString("ko-KR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
  });

  post.save(function (err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

//글 삭제
app.post("/delete", function (req, res) {
  const deleteBtn = req.body.deleteBtn;

  Post.findOneAndRemove({ title: deleteBtn }, function (err) {
    if (!err) {
      console.log("Successfully deleted the post");
      res.redirect("/");
    }
  });
});

//글 수정
app.post("/edit/:postTitle", function (req, res) {
  const requestedPostTitle = req.params.postTitle;

  Post.replaceOne(
    { title: requestedPostTitle },
    {
      title: req.body.title,
      content: req.body.content,
      time: new Date().toLocaleDateString("ko-KR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    },
    function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    }
  );
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started on port 3000");
});
