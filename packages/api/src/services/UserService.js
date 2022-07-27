const {
  PutItemCommand,
  GetItemCommand,
  ScanCommand,
  QueryCommand,
  DeleteItemCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminUpdateUserAttributesCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import ddbClient from "../lib/dynamodb-client";
import identityClient from "../lib/cognito-identity-provider-client";
import randomString from "../shared/randomString";
import { v4 } from "uuid";
const { toUTC } = require("../shared/toUTC");

export async function getUser(data) {
  let resp = {};
  try {
    const param = {
      TableName: "UserTable",
      Key: marshall({
        id: data.id,
      }),
    };

    const cmd = new GetItemCommand(param);
    const { Item } = await ddbClient.send(cmd);
    resp = Item ? unmarshall(Item) : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
  }

  return resp;
}

export async function listUsers() {
  let resp = {};
  try {
    const param = {
      TableName: "UserTable",
    };

    const cmd = new ScanCommand(param);
    const request = await ddbClient.send(cmd);
    const parseResponse = request.Items.map((data) => unmarshall(data));
    resp = request ? parseResponse : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

export async function createUser(data) {
  let resp = {};
  try {
    const rawParams = {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      userType: data.userType,
      company: data.company,
      createdAt: toUTC(new Date()),
    };

    const param = marshall(rawParams);
    const cmd = new PutItemCommand({
      TableName: "UserTable",
      Item: param,
    });

    const request = await ddbClient.send(cmd);

    const compUserParam = {
      id: v4(),
      userId: data.id,
      companyId: data.company.id,
      createdAt: toUTC(new Date()),
    };
    const putCompUserCmd = new PutItemCommand({
      TableName: "CompanyUserTable",
      Item: marshall(compUserParam),
    });

    await ddbClient.send(putCompUserCmd);

    resp = request ? unmarshall(param) : {};
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
  }
  return resp;
}

export async function deleteUser(userId, companyId, email) {
  let resp = {};

  try {
    const compUsersParam = {
      TableName: "CompanyUserTable",
      IndexName: "byUser",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: marshall({
        ":userId": userId,
      }),
    };

    const compUsersCmd = new QueryCommand(compUsersParam);
    const compUsersResult = await ddbClient.send(compUsersCmd);

    const compUsersItems = compUsersResult.Items.map((i) => unmarshall(i));

    const compUsersItemsCnt = compUsersResult.Count;

    if (compUsersItemsCnt == 1) {
      // delete from cognito users
      // delete from users table

      await deleteCognitoUser({
        UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
        Username: email,
      });

      const cmd = new DeleteItemCommand({
        TableName: "UserTable",
        Key: marshall({ id: userId }),
      });
      await ddbClient.send(cmd);
    }

    const filterByCompanyId = compUsersItems.filter(
      (u) => u.companyId === companyId
    );

    if (filterByCompanyId.length != 0) {
      const companyUserId = {
        id: filterByCompanyId[0].id,
      };

      const companyUserCmd = new DeleteItemCommand({
        TableName: "CompanyUserTable",
        Key: marshall(companyUserId),
      });
      await ddbClient.send(companyUserCmd);
    }

    resp = { id: userId };
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }

  return resp;
}

export async function updateUser(id, data) {
  let resp = {};

  try {
    const {
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      UpdateExpression,
    } = getUpdateExpressions(data);

    const param = {
      id,
      ...data,
    };

    const cmd = new UpdateItemCommand({
      TableName: "UserTable",
      Key: marshall({ id }),
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    });
    await ddbClient.send(cmd);

    // await updateCognitoUser({
    //   UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
    //   Username: email,
    //   UserAttributes: [
    //     {
    //       Name: "gi",
    //       Value: data.email,
    //     },
    //     {
    //       Name: "email_verified",
    //       Value: "true",
    //     },
    //   ],

    // });
    resp = param;
  } catch (e) {
    resp = {
      error: e.message,
      errorStack: e.stack,
    };
    console.log(resp);
  }
  return resp;
}

export async function inviteUser(data) {
  const user = await createCognitoUser({
    UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
    Username: data.email,
    DesiredDeliveryMediums: ["EMAIL"],
    TemporaryPassword: randomString(),
    UserAttributes: [
      {
        Name: "email",
        Value: data.email,
      },
      {
        Name: "email_verified",
        Value: "true",
      },
    ],
  });

  data.id = user.id;
  return createUser(data);
}

async function createCognitoUser(input) {
  const cmd = new AdminCreateUserCommand(input);
  const resp = await identityClient.send(cmd);
  const id = resp.User.Attributes.filter((attrib) => attrib.Name === "sub")[0]
    .Value;
  resp.id = id;
  return resp;
}

async function deleteCognitoUser(input) {
  const cmd = new AdminDeleteUserCommand(input);
  const resp = await identityClient.send(cmd);
  return resp;
}

async function updateCognitoUser(input) {
  const cmd = new AdminUpdateUserAttributesCommand(input);
  const resp = await identityClient.send(cmd);
  return resp;
}

export function getUpdateExpressions(data) {
  const values = {};
  const names = {};
  let updateExp = "set ";
  const dataFlatkeys = Object.keys(data);
  for (let i = 0; i < dataFlatkeys.length; i++) {
    names[`#${dataFlatkeys[i]}`] = dataFlatkeys[i];
    values[`:${dataFlatkeys[i]}Val`] = data[dataFlatkeys[i]];

    let separator = i == dataFlatkeys.length - 1 ? "" : ", ";
    updateExp += `#${dataFlatkeys[i]} = :${dataFlatkeys[i]}Val${separator}`;
  }
  return {
    UpdateExpression: updateExp,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: marshall(values),
  };
}
