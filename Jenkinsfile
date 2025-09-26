pipeline {
    agent any

    environment {
        DOCKERHUB_CREDS = credentials('dockerhub-credentials') 
        FRONTEND_IMAGE = 'shouryag11/referbridgefrontend:latest'
        BACKEND_IMAGE = 'sshouryag11/referbridge2:latest'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/ShouryAG111/ReferHub'
            }
        }

        stage('Login to Docker Hub') {
            steps {
                // Use Windows syntax for credentials
                bat 'echo %DOCKERHUB_CREDS_PSW% | docker login -u %DOCKERHUB_CREDS_USR% --password-stdin'
            }
        }

        stage('Build and Push Frontend Image') {
            steps {
                dir('frontend') {
                    bat """
                    docker build -t %FRONTEND_IMAGE% .
                    docker push %FRONTEND_IMAGE%
                    """
                }
            }
        }

        stage('Build and Push Backend Image') {
            steps {
                dir('backend') {
                    bat """
                    docker build -t %BACKEND_IMAGE% .
                    docker push %BACKEND_IMAGE%
                    """
                }
            }
        }
    }

    post {
        success {
            echo 'Docker images built and pushed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
