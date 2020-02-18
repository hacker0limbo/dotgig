#!/usr/bin/env node
const inquirer = require('inquirer')
const fs = require('fs')
const request = require('request')
const _ = require('lodash')
const fuzzy = require('fuzzy')
const InquirerAutocompletePrompt = require('inquirer-autocomplete-prompt')
const types = require('./types.js')

inquirer.registerPrompt('autocomplete', InquirerAutocompletePrompt)

const searchTypes = function(answersSoFar, input) {
  input = input || ''
  return new Promise(function(resolve){
    setTimeout(function(){
      if (input.includes(',')) {
        inputArr = input.split(',')
        input = inputArr[inputArr.length - 1]
      } 
      let fuzzyResult = fuzzy.filter(input, types)
      resolve(fuzzyResult.map(function(el){
        return el.original
      }))
    }, _.random(30, 500))
  })
}

inquirer.prompt([
  {
    type: 'autocomplete',
    message: 'Type Operating Systems, IDEs, or Programming Languages, separated with comma:',
    name: "types",
    source: searchTypes,
    suggestOnly: true,
  }
]).then(answers => {
  const cwd = process.cwd()
  const gitignoreio = 'https://www.gitignore.io/api'
  const { types } = answers
  request(`${gitignoreio}/${types}`, function(error, res, body){
    if (error) {
      return console.log(error)
    }
    
    if (_.isEmpty(types)) {
      // let body be empty
      body = ""
    }

    fs.writeFile(`${cwd}/.gitignore`, body, function(err){
      if (err) {
        return console.log(err)
      }

      if (_.isEmpty(body)) {
        console.log('Empty .gitignore successfully created')

      } else {
        console.log('.gitignore successfully created')
      }
    })  
  })
})