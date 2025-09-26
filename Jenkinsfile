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

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    bat 'docker build -t $FRONTEND_IMAGE .'
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    bat 'docker build -t $BACKEND_IMAGE .'
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                bat 'echo $DOCKERHUB_PASS | docker login -u $DOCKERHUB_USER --password-stdin'
            }
        }

        stage('Push Images') {
            steps {
                bat 'docker push $FRONTEND_IMAGE'
                bat 'docker push $BACKEND_IMAGE'
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
