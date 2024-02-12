const { PrismaClient } = require("@prisma/client");
const isAuthenticated = require("../middlewares/isAuthenticated");
require("dotenv").config;

const router = require("express").Router();

const prisma = new PrismaClient()

//つぶやき投稿用API
router.post("/post", isAuthenticated, async (req, res) => {
    const { content } = req.body;
    if(!content) {
        return res.status(400).json({ message: "投稿内容がありません"});
    }

    try {
        const newPost = await prisma.post.create({
            data: {
                content,
                authorId: req.userId,
            },
            include: {
                author: {
                    include: {
                        profile: true
                    }
                },
            }
        })
        return res.status(200).json(newPost);

    } catch(err) {
        return res.status(500).json({ error: "サーバーエラーです"});
    }
})

//全ユーザー最新つぶやき取得用API
router.get("/get_latest_post", async (req, res) => {
    try {
        const latestPosts = await prisma.post.findMany(
            {
                take: 10,
                orderBy: {
                    createdAt: "desc" 
                },
                include: {
                    author: {
                        include: {
                            profile: true
                        }
                    },
                }
            });
        return res.json(latestPosts);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "サーバーエラーです"})
        
    }
})

//個人の最新つぶやき取得用PI
router.get("/:userId", async (req, res) => {
    const {userId}  = req.params;

    try {
        const userPosts = await prisma.post.findMany(
            {
                where: {
                    authorId: parseInt(userId),
                },
                orderBy: {
                    createdAt: "desc" 
                },
                include: {
                    author: true
                }
            });
        return res.json(userPosts);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "サーバーエラーです"})
        
    }
})

module.exports = router;