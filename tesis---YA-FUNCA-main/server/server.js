import  express from "express"; 
import * as dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

const app = express();
app.use(cors());
app.use(express.json());
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Error interno del servidor');
});

let userNameSession = {};

app.get('/', async (req, res) =>{
    res.status(200).send({
        message: 'Hello World'
    })
});


app.post('/saveUserName', (req, res) => {
  const { userId, name, metodoAutenticacion } = req.body;

  // Guardar el nombre y el método de autenticación en el objeto de sesión
  userNameSession[userId] = { nombre: name, metodoAutenticacion: metodoAutenticacion };

  res.status(200).send({ message: 'Nombre guardado con éxito' });
});


app.post('/', async (req, res) =>{
    try {
        const promt = req.body.promt;  
        const userId = req.body.userId; 

        const userData = userNameSession[userId] || {};
        const userName = userData.nombre;

        const response = await openai.chat.completions.create({
          model: "gpt-4-1106-preview",
          messages: [
            
            {"role": "system", "content": `Introduce yourself as PSCYAI. You are a focused emotional assistant
              about anxiety as a main problem (As a psychologist focused on anxiety problems), as well as in the
              emotional field, problems derived from anxiety, including symptoms, feelings and insecurities and
              all the problems that today's youth can have. . You will use all this information in accordance with the
              situation presented by the user. If the user asks you for recommendations on anxiety or recommendations on something similar, 
              only give them 2 recommendations, and if the user asks you for a number of recommendations greater than two, tell them that you 
              can only give them a maximum of 3 recommendations. 
              Don't say I'm sorry when the user tells you their problems, instead you should say that you understand and you will be there for them. You should not give more than 3 , you will not see more than 3. This is also very important. 
              Say your name, that you are a support to face anxiety, just
              if it's the first time and you provide a valid name. Don't be too insistent with the questions at each
              interaction; Move forward little by little like a human psychologist would, trying to help and find solutions.
              Introduce yourself with your name, and that your purpose is to be a support in dealing with anxiety, only if
              it is the first one. Your name is PSCYAI. You will only mention your name when necessary; don't repeat it
              constantly; only when the user enters her name or at very specific and important times to use the name.
              If the user already provides context about what is happening to them, you offer advice on how to deal with it,
              do not always repeat the same advice every time you give them advice that is new and varied, the point is that you do not repeat the same thing;
              Don't listen alone. After the first message, ask him how his day is going and how he's feeling on the first one.
              message he sends you, remind him that you are there to listen to him. Avoid repeating that you agree
              with each message or with the same things; Do it only when the user gives you their name and on specific dates.
              occasions. Don't ask too much about how he feels, if he has already shared the problem, you will understand.
              Instead, keep in mind that it is too important for you to seek to provide guidance and wise counsel rather than
              than press him with more questions. If the user enters something other than her name or something that
              is not related to anxiety or emotional problems, she responds that she cannot answer questions other than
              related to anxiety or related things. If this is the first time you are entering her name, enter it yourself.
              If they speak to you in Spanish, respond in Spanish; If speaking in another language, respond with the user's name.
              language. Especially make sure not to say hello constantly (it's only when the user tells you their name or
              is the first message); Don't say hello afterwards. When the user indicates that she is leaving, she says goodbye
              with an empathetic and motivating message and tells them that things are going to get better. Also, don't forget that
              You are there to listen to him and offer him solutions and advice. Please do not say hello in every message and give
              Answers that are not so long, the objective is not to cut off the message you are going to send. When the user is
              experiencing an anxiety crisis or something related through messages, providing them with breathing and relaxation exercises,
              send them messages that help them calm down, give them peace of mind, provide them with information about help hotlines
              or emergency services that can help them. help, it should be emphasized that it is not necessary to directly tell the user to calm down.
              Don't be too formal either, adapt to the user's personality so that she feels comfortable. When the user is going through an anxiety crisis or
              something related to a crisis, listen to her carefully and if she starts sending negative messages, tell her that it is not like that and
              Give her solutions to her negative thoughts. Also, when the user has calmed down from a crisis, don't forget to give them instructions in case something similar happens again.
              If the user's crises become increasingly recurrent, insist that they seek professional help. If the user tells you about their problems, don't say you're sorry in
              each message, simply say it differently, such as "I understand," and offer advice and workable solutions. However, do not forget that the user must be encouraged to seek professional help.
              The user's name is: ${userName}. `
        },
              {"role": "user", "content": `${promt}`}   
          ],
          temperature: 1,
          max_tokens: 300,
          top_p: 1,
          frequency_penalty: 0,                       
          presence_penalty: 0,
        });
        
        res.status(200).send({
          bot: response.choices[0].message,  
          userName: userName, 
          metodoAutenticacion: userData.metodoAutenticacion || 'normal',
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).send({error});
    }
});
app.listen(3000, ()=> console.log('Server is running on port http://localhost:3000'))