❌ Failed to start server: Error
    at Query.run (/var/www/7yyhtdd84h8/workspace-server/node_modules/sequelize/lib/dialects/mysql/query.js:52:25)
    at /var/www/7yyhtdd84h8/workspace-server/node_modules/sequelize/lib/sequelize.js:315:28
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async MySQLQueryInterface.createTable (/var/www/7yyhtdd84h8/workspace-server/node_modules/sequelize/lib/dialects/abstract/query-interface.js:98:12)
    at async Notification.sync (/var/www/7yyhtdd84h8/workspace-server/node_modules/sequelize/lib/model.js:942:7)
    at async Sequelize.sync (/var/www/7yyhtdd84h8/workspace-server/node_modules/sequelize/lib/sequelize.js:377:9)
    at async startServer (/var/www/7yyhtdd84h8/workspace-server/server.js:219:9) {
  name: 'SequelizeDatabaseError',
  parent: Error: Failed to open the referenced table 'Users'
      at Packet.asError (/var/www/7yyhtdd84h8/workspace-server/node_modules/mysql2/lib/packets/packet.js:740:17)
      at Query.execute (/var/www/7yyhtdd84h8/workspace-server/node_modules/mysql2/lib/commands/command.js:29:26)
      at Connection.handlePacket (/var/www/7yyhtdd84h8/workspace-server/node_modules/mysql2/lib/base/connection.js:508:34)
      at PacketParser.onPacket (/var/www/7yyhtdd84h8/workspace-server/node_modules/mysql2/lib/base/connection.js:93:12)
      at PacketParser.executeStart (/var/www/7yyhtdd84h8/workspace-server/node_modules/mysql2/lib/packet_parser.js:75:16)
      at Socket.<anonymous> (/var/www/7yyhtdd84h8/workspace-server/node_modules/mysql2/lib/base/connection.js:100:25)
      at Socket.emit (node:events:524:28)
      at addChunk (node:internal/streams/readable:561:12)
      at readableAddChunkPushByteMode (node:internal/streams/readable:512:3)
      at Readable.push (node:internal/streams/readable:392:5) {
    code: 'ER_FK_CANNOT_OPEN_PARENT',
    errno: 1824,
    sqlState: 'HY000',
    sqlMessage: "Failed to open the referenced table 'Users'",
    sql: "CREATE TABLE IF NOT EXISTS `Notifications` (`id` INTEGER auto_increment , `user_id` INTEGER NOT NULL, `type` ENUM('bill_reminder', 'post_published', 'post_scheduled', 'project_deadline', 'budget_alert', 'goal_progress', 'system', 'custom') NOT NULL, `title` VARCHAR(255) NOT NULL, `message` TEXT NOT NULL, `data` JSON COMMENT 'Additional data like billId, projectId, etc.', `priority` ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal', `is_read` TINYINT(1) DEFAULT false, `read_at` DATETIME, `sent_via_web_push` TINYINT(1) DEFAULT false, `sent_via_email` TINYINT(1) DEFAULT false, `sent_via_whatsapp` TINYINT(1) DEFAULT false, `action_url` VARCHAR(500), `expires_at` DATETIME, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY (`id`), FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE=InnoDB;",
    parameters: undefined
  },
  original: Error: Failed to open the referenced table 'Users'
      at Packet.asError (/var/www/7yyhtdd84h8/workspace-server/node_modules/mysql2/lib/packets/packet.js:740:17)
      at Query.execute (/var/www/7yyhtdd84h8/workspace-server/node_modules/mysql2/lib/commands/command.js:29:26)
      at Connection.handlePacket (/var/www/7yyhtdd84h8/workspace-server/node_modules/mysql2/lib/base/connection.js:508:34)
      at PacketParser.onPacket (/var/www/7yyhtdd84h8/workspace-server/node_modules/mysql2/lib/base/connection.js:93:12)
      at PacketParser.executeStart (/var/www/7yyhtdd84h8/workspace-server/node_modules/mysql2/lib/packet_parser.js:75:16)
      at Socket.<anonymous> (/var/www/7yyhtdd84h8/workspace-server/node_modules/mysql2/lib/base/connection.js:100:25)
      at Socket.emit (node:events:524:28)
      at addChunk (node:internal/streams/readable:561:12)
      at readableAddChunkPushByteMode (node:internal/streams/readable:512:3)
      at Readable.push (node:internal/streams/readable:392:5) {
    code: 'ER_FK_CANNOT_OPEN_PARENT',
    errno: 1824,
    sqlState: 'HY000',
    sqlMessage: "Failed to open the referenced table 'Users'",
    sql: "CREATE TABLE IF NOT EXISTS `Notifications` (`id` INTEGER auto_increment , `user_id` INTEGER NOT NULL, `type` ENUM('bill_reminder', 'post_published', 'post_scheduled', 'project_deadline', 'budget_alert', 'goal_progress', 'system', 'custom') NOT NULL, `title` VARCHAR(255) NOT NULL, `message` TEXT NOT NULL, `data` JSON COMMENT 'Additional data like billId, projectId, etc.', `priority` ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal', `is_read` TINYINT(1) DEFAULT false, `read_at` DATETIME, `sent_via_web_push` TINYINT(1) DEFAULT false, `sent_via_email` TINYINT(1) DEFAULT false, `sent_via_whatsapp` TINYINT(1) DEFAULT false, `action_url` VARCHAR(500), `expires_at` DATETIME, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY (`id`), FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE=InnoDB;",
    parameters: undefined
  },
  sql: "CREATE TABLE IF NOT EXISTS `Notifications` (`id` INTEGER auto_increment , `user_id` INTEGER NOT NULL, `type` ENUM('bill_reminder', 'post_published', 'post_scheduled', 'project_deadline', 'budget_alert', 'goal_progress', 'system', 'custom') NOT NULL, `title` VARCHAR(255) NOT NULL, `message` TEXT NOT NULL, `data` JSON COMMENT 'Additional data like billId, projectId, etc.', `priority` ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal', `is_read` TINYINT(1) DEFAULT false, `read_at` DATETIME, `sent_via_web_push` TINYINT(1) DEFAULT false, `sent_via_email` TINYINT(1) DEFAULT false, `sent_via_whatsapp` TINYINT(1) DEFAULT false, `action_url` VARCHAR(500), `expires_at` DATETIME, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY (`id`), FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE=InnoDB;",
  parameters: {}
