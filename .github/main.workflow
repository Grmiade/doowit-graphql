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
  secrets = ["ZEIT_TOKEN"]
  env = {
    MONGO_HOST = "mongodb://Grmiade:Azerty5811!M@ds213472.mlab.com:13472/doowit"
  }
  needs = ["Build"]
}
