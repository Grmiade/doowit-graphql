workflow "New workflow" {
  on = "push"
  resolves = ["GitHub Action for Zeit"]
}

action "GitHub Action for npm" {
  uses = "actions/npm@e7aaefe"
  runs = "install"
}

action "GitHub Action for npm-1" {
  uses = "actions/npm@e7aaefe"
  needs = ["GitHub Action for npm"]
  runs = "run-script build"
}

action "GitHub Action for Zeit" {
  uses = "actions/zeit-now@9fe84d5"
  needs = ["GitHub Action for npm-1"]
  runs = "deploy"
  secrets = ["ZEIT_TOKEN"]
  env = {
    MONGO_HOST = "mongodb://Grmiade:Azerty5811!M@ds213472.mlab.com:13472/doowit"
  }
}
