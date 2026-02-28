import { Client, Account, Databases, ID, Query } from "appwrite";

export const client = new Client();

client
    .setEndpoint("https://cloud.appwrite.io/v1") // Standard Cloud Endpoint
    .setProject("699d5b16002cbbcac174"); // Your Project ID

export const account = new Account(client);
export const databases = new Databases(client);
export { ID, Query };
