#!/usr/bin/env node
const program = require('commander')
const download = require('download-git-repo')
const inquirer = require('inquirer')
const handlebars = require('handlebars')
const fs = require('fs')
const ora = require('ora')
const chalk = require('chalk')
const symbols = require('log-symbols')

program
  .version('0.0.1', '-v, --version')
  .command('init <name>')
  .action(name => {
    if (fs.existsSync(name)) {
      console.log(symbols.error, chalk.red('项目已存在'))
      return
    }
    inquirer
      .prompt([
        {
          name: 'description',
          message: '请输入项目描述'
        },
        {
          name: 'author',
          message: '请输入作者名称'
        }
      ])
      .then(answers => {
        download(
          'https://git.datatub.com:Uranus/general-template#master',
          name,
          { clone: true },
          err => {
            const spinner = ora('正在下载模板...')
            spinner.start()
            if (!err) {
              spinner.succeed()
              const meta = {
                name,
                description: answers.description,
                author: answers.author
              }
              const fileName = `${name}/package.json`
              if (fs.existsSync(fileName)) {
                const content = fs.readFileSync(fileName).toString()
                const result = handlebars.compile(content)(meta)
                fs.writeFileSync(fileName, result)
              }
              console.log(symbols.success, chalk.green('项目初始化完成'))
            } else {
              spinner.fail()
              console.log(symbols.error, chalk.red(`拉取远程仓库失败${err}`))
            }
          }
        )
      })
  })
program.parse(process.argv)
