workflow "Deploy" {
  on = "push"
  resolves = ["Alias"]
}

action "Build & Deploy" {
  uses = "actions/zeit-now@9fe84d5"
  secrets = ["ZEIT_TOKEN"]
  args = "deploy"
}

action "Alias" {
  uses = "actions/zeit-now@9fe84d5"
  needs = ["Build & Deploy"]
  secrets = ["ZEIT_TOKEN"]
  args = "alias"
}
