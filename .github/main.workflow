workflow "New workflow" {
  on = "push"
  resolves = ["Alias"]
}

action "Install dependencies" {
  uses = "actions/npm@e7aaefe"
  args = "install"
}

action "Deploy" {
  uses = "actions/zeit-now@9fe84d5"
  secrets = ["ZEIT_TOKEN"]
  args = "deploy"
}

action "Alias" {
  uses = "actions/zeit-now@9fe84d5"
  needs = ["Deploy"]
  secrets = ["ZEIT_TOKEN"]
  args = "alias"
}
