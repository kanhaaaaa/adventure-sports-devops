Project Title- Adventure Sports DevOps Project


Problem Statement-


Arhitecture  Diagram-
<img width="1536" height="1024" alt="Software architectur" src="https://github.com/user-attachments/assets/e14de63d-6e83-4182-8bbd-34539cce6fbf" />


CI/CD Pipeline Explanation-

We implemented a CI/CD pipeline using GitHub Actions.
Steps:
1. Code is pushed to GitHub
2. GitHub Actions triggers automatically
3. Code is checked out
4. Secret scanning is performed using Gitleaks
5. Maven builds the project and runs tests
6. Docker image is created
7. (Future scope: deployment step)

This ensures automated build and validation of the application.


Git Workflow Used-

We followed a feature-branch workflow:
- main → production-ready code
- develop → integration branch
- feature branches:
  - backend-feature
  - frontend-feature
  - devops-feature
  - database-feature

Workflow:
Feature → Develop → Testing → Main

Pull requests were used for merging.


Tools Used-
- Git & GitHub → Version control
- Maven → Build automation
- GitHub Actions → CI pipeline
- Docker → Containerization
- MySQL → Database
- Postman → API testing
- Gitleaks → Secret scanning


