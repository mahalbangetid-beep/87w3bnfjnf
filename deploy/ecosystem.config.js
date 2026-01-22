module.exports = {
    apps: [
        {
            name: 'workspace-api',
            cwd: '/var/www/ourproject/workspace-server',
            script: 'server.js',
            instances: 'max',
            exec_mode: 'cluster',
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'development',
                PORT: 5000
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5000
            },
            error_file: '/var/log/pm2/workspace-api-error.log',
            out_file: '/var/log/pm2/workspace-api-out.log',
            log_file: '/var/log/pm2/workspace-api.log',
            time: true,
            merge_logs: true,
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
        }
    ]
};
