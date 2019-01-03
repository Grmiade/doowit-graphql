workflow "New workflow" {
  on = "push"
  resolves = ["Deploy"]
}

action "Install dependencies" {
  uses = "actions/npm@e7aaefe"
  args = "install"
}

action "Build" {
  uses = "actions/npm@e7aaefe"
  needs = ["Install dependencies"]
  args = "run-script build"
}

action "Deploy" {
  uses = "actions/zeit-now@9fe84d5"
  needs = ["Build"]
  secrets = ["ZEIT_TOKEN"]
  args = "-e NODE_ENV=production -e MONGO_HOST=@mongo-host"
}
