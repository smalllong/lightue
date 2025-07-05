# Contributing

## Environment prepare

Make sure you have Node.js installed. Then:
```
npm i -g bun
npm i -g coffeescript

bun i
```
You're ready to go


## Demo testing

To test Lightue with the demo, run:
```
bun dist -w
bun demo
```
Now you're ready to preview the demo/index.html with any server of your choise (suggest Live Server in VSCode).


## How to release a new version

- change to new version number in package.json
- `bun dist`
- commit the change (potentially together with other changes)
- `git tag -a ${new version number}`, add release description
- `npm publish`
