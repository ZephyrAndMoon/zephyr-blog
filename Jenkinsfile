pipeline {
    agent any
    stages {
        stage('Build') {
            steps {  // window 使用 bat， linux 使用 sh
                sh 'yarn'
                sh 'npm run build'
            }
        }
        stage('Deploy') {
            steps {
                sh 'rm -rf /usr/zephyr-blog/*' // 这里需要改成你的静态服务器资源目录
                sh 'mv ./zephyr-blog/* /usr/zephyr-blog/' // 这里需要改成你的静态服务器资源目录
            }
        }
    }
}