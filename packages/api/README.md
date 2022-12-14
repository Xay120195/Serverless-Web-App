## Serverless AppSync

This lab will immerse students about the components of [AWS AppSync](https://aws.amazon.com/appsync/) using [Serverless Framework.](https://www.serverless.com/)

### Prerequisites

- [NodeJS Version 14 or later](https://nodejs.org/en/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Watchman](https://facebook.github.io/watchman/docs/install.html#buildinstall)
- [pnmp](https://pnpm.io/installation#using-npm)

### Installing project dependencies and simulator execution


**1. Install pnpm**

Go to packages/api - app directory and execute

    pnpm install

**2. Run Docker**

Open docker app. Make sure that the docker engine is running, then execute

    docker-compose up 

**3. Deploy simulator**

Open another terminal while the current process is running, then execute

    pnpm run dev

Open the AppSync Simulator link provided: [http://192.168.254.131:20002]


### Understanding the serverless.yml file

_serverless.yml_ is a cloudformation-like template that compiles to vanilla cloudformation. It has some powerful transforms working with popular AWS serverless services like Lambda, API Gateway and DynamoDB. It can also be extended via their rich [plugins ecosystem.](https://www.serverless.com/plugins)


### Working with Lambda Functions

In the serverless.yml file, there is a section called **functions** as seen in the screenshot.


### Functions Section

Notice the **_addTwoNumber-fn_** with a handler pointing to our code in the file system at **src/handlers/\*\*\***

Invoke the function by issuing the command:

    npx sls invoke local --function addTwoNumbers-fn --path src/handlers/addTwoNumbers/event.json

Edit the **event.json** file with the following values:

    {
        "first": 0,
        "second": 2
    }
