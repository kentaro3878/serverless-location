'use strict'

const uuid = require('uuid')
const dynamodb = require('../lib/dynamodb')
const moment = require('moment')

module.exports.create = (event, context, callback) => {
  const timestamp = new Date().getTime()
  const data = JSON.parse(event.body)
  if (typeof data.user_id !== 'string') {
    console.error('Validation Failed')
    callback(null, {
      statusCode: 400,
      headers: { 
        'Content-Type': 'text/plain',
        "Access-Control-Allow-Origin" : "*"
      },
      body: 'Couldn\'t create the todo item.',
    })
    return
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id: uuid.v1(),
      user_id: data.user_id,
      lat_north_south: data.location.lat_north_south,
      latitude: data.location.latitude,
      lon_west_east: data.location.lon_west_east,
      longitude: data.location.longitude,
      timestamp: data.timestamp,
      date: moment().format('YYYYMMDD'),
    },
  }

  // write the todo to the database
  dynamodb.put(params, (error) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 
          "Access-Control-Allow-Credentials": true,
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin" : "*"
        },
        body: 'Couldn\'t create the todo item.',
      })
      return
    }

    // create a response
    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
      },
      body: JSON.stringify(params.Item),
    }
    callback(null, response);
  })
}