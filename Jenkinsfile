pipeline {
    agent any

    environment {
        DOCKERHUB_CREDS = credentials('dockerhub-credentials') 
        FRONTEND_IMAGE = 'shouryag11/referbridgefrontend:latest'
        BACKEND_IMAGE = 'shouryag11/referbridge2:latest'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/ShouryAG111/ReferHub'
            }
        }

        stage('Login to Docker Hub') {
            steps {
                bat 'echo %DOCKERHUB_CREDS_PSW% | docker login -u %DOCKERHUB_CREDS_USR% --password-stdin'
            }
        }

        stage('Build and Push Frontend Image') {
            steps {
                dir('client') {
                    bat """
                    docker build -t %FRONTEND_IMAGE% .
                    docker push %FRONTEND_IMAGE%
                    """
                }
            }
        }

        stage('Build and Push Backend Image') {
            steps {
                dir('server') {
                    withCredentials([
                        string(credentialsId: 'mongo-uri', variable: 'MONGO_URI'),
                        string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET')
                    ]) {
                        bat """
                        docker build --build-arg MONGO_URI=%MONGO_URI% ^
                                     --build-arg JWT_SECRET=%JWT_SECRET% ^
                                     -t %BACKEND_IMAGE% .
                        docker push %BACKEND_IMAGE%
                        """
                    }
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
