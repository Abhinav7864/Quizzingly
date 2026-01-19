
import prisma from './src/db/prisma.js';

async function main() {
  try {
    let quiz = await prisma.quiz.findFirst({
        include: { questions: { include: { options: true } } }
    });
    
    if (!quiz) {
        console.log("No quiz found. Creating a dummy quiz...");
        const user = await prisma.user.create({
            data: {
                username: "testuser_" + Date.now(),
                email: "test_" + Date.now() + "@example.com",
                password: "hashedpassword", 
            }
        });
        
        quiz = await prisma.quiz.create({
            data: {
                title: "Test Quiz",
                creatorId: user.id,
                questions: {
                    create: [
                        {
                            text: "What is 2 + 2?",
                            timeLimit: 10,
                            options: {
                                create: [
                                    { text: "3", isCorrect: false },
                                    { text: "4", isCorrect: true },
                                    { text: "5", isCorrect: false },
                                    { text: "22", isCorrect: false }
                                ]
                            }
                        }
                    ]
                }
            },
            include: { questions: true }
        });
    } else if (quiz.questions.length === 0) {
        console.log("Quiz found but has no questions. Adding one...");
        await prisma.question.create({
            data: {
                text: "Sample Question?",
                quizId: quiz.id,
                timeLimit: 10,
                options: {
                    create: [
                        { text: "A", isCorrect: true },
                        { text: "B", isCorrect: false }
                    ]
                }
            }
        });
    }
    
    console.log("VALID_QUIZ_ID=" + quiz.id);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
