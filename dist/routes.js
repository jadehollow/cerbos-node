"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const db = require("./db.js");
const authorization = require("./authorization");
const checkPostExistAndGet = (id) => {
    const getPost = db.posts.find((item) => item.id === Number(id));
    if (!getPost)
        throw new Error("Post doesn't exist");
    return getPost;
};
router.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, content } = req.body;
        const { user_id: userId } = req.headers;
        yield authorization(userId, "create", req.body);
        const newData = {
            id: Math.floor(Math.random() * 999999 + 1),
            title,
            content,
            userId: Number(userId),
            flagged: false,
        };
        db.posts.push(newData);
        res.status(201).json({
            code: 201,
            data: newData,
            message: "Post created successfully",
        });
    }
    catch (error) {
        next(error);
    }
}));
router.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getPosts = db.posts.filter((item) => item.flagged === false);
        const { user_id: userId } = req.headers;
        yield authorization(userId, "view:all");
        res.json({
            code: 200,
            data: getPosts,
            message: "All posts fetched successfully",
        });
    }
    catch (error) {
        next(error);
    }
}));
router.get("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getPost = db.posts.find((item) => item.flagged === false && item.id === Number(req.params.id));
        const { user_id: userId } = req.headers;
        yield authorization(userId, "view:single");
        res.json({
            code: 200,
            data: getPost,
            message: "Post fetched successfully",
        });
    }
    catch (error) {
        next(error);
    }
}));
router.patch("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, content } = req.body;
        let updatedContent = { title, content };
        const { user_id: userId } = req.headers;
        const postId = req.params.id;
        checkPostExistAndGet(postId);
        const tempUpdatedPosts = db.posts.map((item) => {
            if (item.id === Number(postId)) {
                updatedContent = Object.assign(Object.assign({}, item), updatedContent);
                return updatedContent;
            }
            return item;
        });
        yield authorization(userId, "update", updatedContent);
        db.posts = tempUpdatedPosts;
        res.json({
            code: 200,
            data: updatedContent,
            message: "Post updated successfully",
        });
    }
    catch (error) {
        next(error);
    }
}));
router.delete("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id: userId } = req.headers;
        const postId = req.params.id;
        const post = checkPostExistAndGet(postId);
        const allPosts = db.posts.filter((item) => item.flagged === false && item.id !== Number(postId));
        yield authorization(userId, "delete", post);
        db.posts = allPosts;
        res.json({
            code: 200,
            message: "Post deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
}));
router.post("/flag/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let flaggedContent = {
            flagged: req.body.flag,
        };
        const { user_id: userId } = req.headers;
        const postId = req.params.id;
        checkPostExistAndGet(postId);
        const tempUpdatedPosts = db.posts.map((item) => {
            if (item.id === Number(postId)) {
                flaggedContent = Object.assign(Object.assign({}, item), flaggedContent);
                return flaggedContent;
            }
            return item;
        });
        yield authorization(userId, "flag", flaggedContent);
        db.posts = tempUpdatedPosts;
        res.json({
            code: 200,
            data: flaggedContent,
            message: `Post ${req.body.flag ? "flagged" : "unflagged"} successfully`,
        });
    }
    catch (error) {
        next(error);
    }
}));
module.exports = router;
