# Mellow-Tools

Welcome to Mellow Tools - a platform crafted out of a passion for simplifying digital workflows. My goal is to provide intuitive, user-friendly tools that help developers, designers, and tech enthusiasts alike streamline their tasks, enhance productivity, and focus on what truly matters.

This repository contains the complete code regarding Mellow Tools.

Visit 
[Mellow Tools](https://mellow-tools.vercel.app/) for more details about the product.

The project is open source and any contributions are more than welcome.

## SETUP

Add the following variables 

1. /client/.env

```
VITE_ENV=
VITE_EDITOR_KEY=
```

- `VITE_ENV` : PROD or DEV
- `VITE_EDITOR_KEY` : Tiny MCE Editor Key

2. /server/.env

```
DATABASE=
MONGODB_PASSWORD=
NODE_ENV=
TOKEN_SECRET=
```

- `DATABASE` : MongoDB Query String with password field set as <PASSWORD>. 
Ex: `mongodb+srv://demoUser:<PASSWORD>@cluster0.example.mongodb.net/?retryWrites=true&w=majority`
- `MONGODB_PASSWORD` : MongoDB User Password 
- `NODE_ENV` : PROD or DEV
- `TOKEN_SECRET` : Secret to generate jwt tokens. 

## Run Project 

1. `cd client` 
2. `npm start`
3. `cd ../server`
4. `npm run dev`
