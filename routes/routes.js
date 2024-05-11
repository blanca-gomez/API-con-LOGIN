const express = require('express');
const router = express.Router();
const axios = require('axios');
const users = require("../data/users.js");
const { generateToken, verifyToken } = require("../middleware/middleware.js");

router.get('/', (req, res) => {
    const loginUser = `
    <form action="/login" method="post">
        <label for="username">Usuario:</label>
        <input type="text" id="username" name="username" required></br>
        <label for="password">Contraseña:</label>
        <input type="password" id="password" name="password" required></br>
        <button type="submit">Iniciar sesión</button>
    </form>
    `;
    res.send(loginUser);
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find((u) => u.username === username && u.password === password);

    if (user) {
        const token = generateToken(user);
        req.session.token = token;
        res.redirect('/search');
    } else {
        res.status(401).json({ message: 'usuario o contraseña incorrecta' });
    }
});

router.get('/search', verifyToken, (req, res) => {
    const userId = req.user;
    const user = users.find((u) => u.id === userId);
    if (user) {
        res.send(`
            <h1>Bienvenido ${user.name}!</h1>
            <h2>Encuentra tu personaje</h2>
            <form action="/search" method="post">
                <label name="characterName">Introduce el nombre del personaje</label>
                <input type="text" id="characterName" name="characterName"/>
                <button type="submit">Obtener personaje</button>
            </form>
            <div id="characterInfo"></div>
            <a href="/">Inicio</a>
        `);
    } else {
        res.status(401).json({ message: 'Usuario no encontrado' });
    }
});

router.post('/search', verifyToken, async (req, res) => {
    const characterName = req.body.characterName;
    if (characterName) {
        try {
            const url = `https://rickandmortyapi.com/api/character/?name=${characterName}`;
            const response = await axios.get(url);
            const character = response.data.results[0];
            if (character) {
                const { name, status, species, gender, image, origin: { name: originName } } = character;
                const responseHTML = `
                    <h2>${name}</h2>
                    <img src="${image}" alt="${name}"/>
                    <ul>
                        <li>${status}</li>
                        <li>${species}</li>
                        <li>${gender}</li>
                        <li>${originName}</li>
                    </ul>
                `;
                res.send(responseHTML);
            } else {
                res.status(404).json({ message: 'Personaje no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener el personaje' });
        }
    } else {
        res.status(400).json({ message: 'Nombre del personaje no proporcionado' });
    }
});

router.get('/characters',verifyToken, async (req,res) => {
    const url = 'https://rickandmortyapi.com/api/character'
    try{
        const response = await axios.get(url);
        const characters = response.data.results;
        res.json(characters)
    }
    catch (err) {
        res.status(500).json({message:'No se pudo obtener los personajes'})
    }
});

router.get('/characters/:name', verifyToken, async (req,res) => {
    const name = req.params.name;
    const url = `https://rickandmortyapi.com/api/character/?name=${name}`;
    try{
        const response = await axios.get(url);
        const character = response.data.results[0];
        if (character) {
            const { name, status, species, gender, image , origin: {name:originName} } = character;
            const responseHTML = `
                <h2>${name}</h2>
                <img src="${image}" alt="${name}"/>
                <ul>
                    <li>${status}</li>
                    <li>${species}</li>
                    <li>${gender}</li>
                    <li>${originName}</li>
                </ul>
            `;
            res.send(responseHTML);
        } else {
            res.status(404).json({ message: 'Personaje no encontrado' });
        }
    } catch (err) {
        res.status(500).json({message : 'No se pudo obtener los personajes'});
    }
});

module.exports = router;
