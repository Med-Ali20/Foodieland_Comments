const axios = require("axios");

// Airtable Data -- FB
const airtableAccessToken =
  process.env.AIRTABLE_ACCESS_TOKEN;
const baseId = process.env.BASE_ID;
const tableId = process.env.TABLE_ID;

//--IG

const instagramTableId = process.env.INSTAGRAM_TABLE_ID;

// Airtable Functions

const createAirtableRecord = async (fields, platform) => {
  try {
    const res = await axios.post(
      `https://api.airtable.com/v0/${baseId}/${ platform === 'FB' ? tableId : instagramTableId} `,
      {
        fields,
        typecast: true,
      },
      {
        headers: {
          Authorization: `Bearer ${airtableAccessToken}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const getAirtableRecords = async (offset, platform) => {
  try {
    const res = await axios.get(
      `https://api.airtable.com/v0/${baseId}/${platform === "FB" ? tableId : instagramTableId}`,
      {
        headers: {
          Authorization: `Bearer ${airtableAccessToken}`,
        },
        params: {
          offset: offset ? offset : null,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

async function getAirtableComments(platform) {
  let offset;
  let comments = []; // An array to hold all the data

  while (true) {
    // Keep looping until all the data is fetched
    await new Promise((resolve) => setTimeout(resolve, 200)); // Add a delay of 300ms

    const response = await getAirtableRecords(offset, platform);
    const records = response.records;
    comments = comments.concat(records); // Add the data to the array

    if (!response.offset) {
      // No more data to fetch, exit loop
      break;
    }

    offset = response.offset; // Move to the next page
  }
  return comments; // Return all the fetched data
}

const createComment = async (comment) => {
  try {
    const airtableComments = await getAirtableComments("FB");
    const commentId = comment["Comment ID"];
    const existingComments = airtableComments.filter(
      (comment) => commentId === comment.fields["Comment ID"]
    );
    if (existingComments.length == 0) {
      createAirtableRecord(comment, "FB");
    }
  } catch (error) {
    console.log(error);
  }
};

const createInstagramComment = async(comment) => {
  try {
    const airtableComments = await getAirtableComments("IG");
    const commentId = comment["Comment ID"];
    const existingComments = airtableComments.filter(
      (comment) => commentId === comment.fields["Comment ID"]
    );
    if (existingComments.length == 0) {
      createAirtableRecord(comment, "IG");
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  createComment,
  createInstagramComment
};
