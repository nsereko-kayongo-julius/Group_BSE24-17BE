# RESTful API Node Express Mongoose Example

The project builds RESTful APIs using Node.js, Express and Mongoose, ...

## Manual Installation

Clone the repo:

```bash
git clone https://github.com/nsereko-kayongo-julius/Group_BSE24-17BE.git
cd Group_BSE24-17BE
```

Install the dependencies:

```bash
npm install
```

## Table of Contents

- [Commands](#commands)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)

## Commands

Running in development:

```bash
npm start
# or
npm run dev
```

Running in production:

```bash
# build
npm run build
# start
npm run prod
```

## Environment Variables

The environment variables can be found and modified in the `.env` file.

```bash
# App name
APP_NAME = # default App Name

# Host
HOST = # default 0.0.0.0
# Port
PORT = # default 666


```

## Project Structure

```

src\
 |--config\         # Environment variables and configuration
 |--controllers\    # Controllers
 |--models\         # Mongoose models
 |--routes\         # Routes
 |--services\       # Business logic
 |--index.js        # App entry point
```

## License

[MIT](LICENSE)
