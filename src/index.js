require('dotenv').config();

const cors = require("cors");
const express =  require("express");
const { uuid, isUuid } = require("uuidv4");
const { request } = require("express");

const app = express();

app.use(cors());
app.use(express.json());

const scraps = [];

function logRequests(request, response, next) {
    console.time("tempo");

        const { method, url } = request;

            const logLabel = `[${method.toUpperCase()}] ${url}`;

        next();

        console.log(logLabel);
    console.timeEnd("tempo");
  }

function validaId(request, response, next) {
    const { id } = request.params;

    if(!isUuid(id)) {
        return response
            .status(400)
            .json({ error: "Param sent is not a valid UUID" });
    }
    next();
}

function validateTitleAndMessage(request, response, next) {
    const { title , message } = request.body;
  
    if (title == "" || message == ""){
      return response.status(400).json({ error: "Param sent is not a valid Title" });
    }
    
    next();
  }

app.use(logRequests);
app.use(validateTitleAndMessage);
app.use("/projects/:id", validaId);

app.get('/scraps', (request, response) => { //Busca os scraps inseridos
    const { title } = request.query;

    const results = title
        ? scraps.filter(scrap => 
            scrap.title.toLowerCase().includes(title.toLowerCase()))
        :   scraps;
        
    return response.json(results);
});

app.post('/scraps', (request, response) => { //Insere scraps
    const { title, message } = request.body;

    const scrap = { id: uuid(), title, message };

    scraps.push(scrap)

    return response.json(scrap);
});

app.put('/scraps/:id', (request, response) => { //Edita scraps
    const { id } = request.params;
    const { title, message } = request.body;

    const scrapIndex = scraps.findIndex(scrap => scrap.id == id);

    if(scrapIndex < 0) {
        return response.status(400).json({ error: "Scrap not found" });
    }

    const scrap = {
        id, 
        title, 
        message
    };

    scraps[scrapIndex] = scrap;

    return response.json(scrap);
}); 

app.delete('/scraps/:id', (request, response) => {// Deleta scraps
    const { id } = request.params;

    const scrapIndex = scraps.findIndex(scrap => scrap.id == id);

    if(scrapIndex < 0) {
        return response.status(400).json({ error: "Scrap not found" });
    }

    scraps.splice(scrapIndex, 1);

    return response.status(204).send(); //código de sucesso com resposta vazia
});

const port =  process.env.PORT || 3333;
app.listen(port, () => {
    console.log(`Server up nd running on PORT ${port}`)
});