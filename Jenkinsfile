#!groovy
pipeline {
    agent { label 'sl7'}
    stages {
        stage('Preparation') {
            steps {
                checkout scm
                sh 'npm i'
            }
        }
        stage('Unit Tests') {
            steps {
                sh 'npm run test:ci'
            }
            post {
                always {
                    junit 'junit.xml'
                }
            }
        }
        stage('E2E Tests') {
            steps {
                sh 'npm run e2e:ci'
            }
            post {
                always {
                    junit 'e2e_results.xml'
                }
                unsuccessful {
                    archiveArtifacts artifacts: 'cypress/screenshots/*'
                }
            }
        }
    }
}
