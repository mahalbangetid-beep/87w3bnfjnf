-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versi server:                 8.4.3 - MySQL Community Server - GPL
-- OS Server:                    Win64
-- HeidiSQL Versi:               12.13.0.7147
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- membuang struktur untuk table ucuy.activations
CREATE TABLE IF NOT EXISTS `activations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `code` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `completed` tinyint(1) NOT NULL DEFAULT '0',
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activations_user_id_index` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.activations: ~0 rows (lebih kurang)
INSERT INTO `activations` (`id`, `user_id`, `code`, `completed`, `completed_at`, `created_at`, `updated_at`) VALUES
	(1, 1, 'TlwmrIS8pppON5axXqiPmfdLAkzJWFUN', 1, '2025-09-11 19:44:24', '2025-09-11 19:44:24', '2025-09-11 19:44:24');

-- membuang struktur untuk table ucuy.admin_notifications
CREATE TABLE IF NOT EXISTS `admin_notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_label` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action_url` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `permission` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.admin_notifications: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.announcements
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `has_action` tinyint(1) NOT NULL DEFAULT '0',
  `action_label` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action_url` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action_open_new_tab` tinyint(1) NOT NULL DEFAULT '0',
  `dismissible` tinyint(1) NOT NULL DEFAULT '0',
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.announcements: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.announcements_translations
CREATE TABLE IF NOT EXISTS `announcements_translations` (
  `lang_code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `announcements_id` bigint unsigned NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `action_label` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`lang_code`,`announcements_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.announcements_translations: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.audit_histories
CREATE TABLE IF NOT EXISTS `audit_histories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `user_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Botble\\ACL\\Models\\User',
  `module` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `request` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `action` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actor_id` bigint unsigned NOT NULL,
  `actor_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Botble\\ACL\\Models\\User',
  `reference_id` bigint unsigned NOT NULL,
  `reference_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_histories_user_id_index` (`user_id`),
  KEY `audit_histories_module_index` (`module`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.audit_histories: ~16 rows (lebih kurang)
INSERT INTO `audit_histories` (`id`, `user_id`, `user_type`, `module`, `request`, `action`, `user_agent`, `ip_address`, `actor_id`, `actor_type`, `reference_id`, `reference_name`, `type`, `created_at`, `updated_at`) VALUES
	(12, 1, 'Botble\\ACL\\Models\\User', 'to the system', NULL, 'logged in', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '127.0.0.1', 1, 'Botble\\ACL\\Models\\User', 1, 'Yusuf Efendi', 'info', '2025-12-30 03:02:24', '2025-12-30 03:02:24'),
	(13, 1, 'Botble\\ACL\\Models\\User', 'menu_location', '{"name":"Main Menu","deleted_nodes":"2 3 4","menu_nodes":"[{\\"menuItem\\":{\\"id\\":1,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":1,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/home\\",\\"icon_font\\":null,\\"position\\":0,\\"title\\":\\"Home\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":1,\\"children\\":[]},\\"children\\":[]},{\\"menuItem\\":{\\"id\\":5,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":2,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/services\\",\\"icon_font\\":null,\\"position\\":1,\\"title\\":\\"Services\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":6,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":3,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/projects\\",\\"icon_font\\":null,\\"position\\":2,\\"title\\":\\"Portfolio\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":7,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":4,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/pricing\\",\\"icon_font\\":null,\\"position\\":3,\\"title\\":\\"Pricing\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":8,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":5,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/blog\\",\\"icon_font\\":null,\\"position\\":4,\\"title\\":\\"Blog\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":9,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":6,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/contact\\",\\"icon_font\\":null,\\"position\\":5,\\"title\\":\\"Contact\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}}]","menu_id":"1","title":"Contact","url":"\\/","icon_font":null,"css_class":null,"target":"_self","locations":["main-menu"],"submitter":"apply","language":"en_US","status":"published"}', 'created', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '127.0.0.1', 1, 'Botble\\ACL\\Models\\User', 1, 'ID: 1', 'info', '2025-12-30 03:07:07', '2025-12-30 03:07:07'),
	(14, 1, 'Botble\\ACL\\Models\\User', 'menu', '{"name":"Main Menu","deleted_nodes":"2 3 4","menu_nodes":"[{\\"menuItem\\":{\\"id\\":1,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":1,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/home\\",\\"icon_font\\":null,\\"position\\":0,\\"title\\":\\"Home\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":1,\\"children\\":[]},\\"children\\":[]},{\\"menuItem\\":{\\"id\\":5,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":2,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/services\\",\\"icon_font\\":null,\\"position\\":1,\\"title\\":\\"Services\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":6,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":3,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/projects\\",\\"icon_font\\":null,\\"position\\":2,\\"title\\":\\"Portfolio\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":7,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":4,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/pricing\\",\\"icon_font\\":null,\\"position\\":3,\\"title\\":\\"Pricing\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":8,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":5,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/blog\\",\\"icon_font\\":null,\\"position\\":4,\\"title\\":\\"Blog\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":9,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":6,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/contact\\",\\"icon_font\\":null,\\"position\\":5,\\"title\\":\\"Contact\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}}]","menu_id":"1","title":"Contact","url":"\\/","icon_font":null,"css_class":null,"target":"_self","locations":["main-menu"],"submitter":"apply","language":"en_US","status":"published"}', 'updated', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '127.0.0.1', 1, 'Botble\\ACL\\Models\\User', 1, 'Main Menu', 'primary', '2025-12-30 03:07:08', '2025-12-30 03:07:08'),
	(15, 1, 'Botble\\ACL\\Models\\User', 'menunode', '{"name":"Main Menu","deleted_nodes":"2 3 4","menu_nodes":"[{\\"menuItem\\":{\\"id\\":1,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":1,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/home\\",\\"icon_font\\":null,\\"position\\":0,\\"title\\":\\"Home\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":1,\\"children\\":[]},\\"children\\":[]},{\\"menuItem\\":{\\"id\\":5,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":2,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/services\\",\\"icon_font\\":null,\\"position\\":1,\\"title\\":\\"Services\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":6,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":3,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/projects\\",\\"icon_font\\":null,\\"position\\":2,\\"title\\":\\"Portfolio\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":7,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":4,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/pricing\\",\\"icon_font\\":null,\\"position\\":3,\\"title\\":\\"Pricing\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":8,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":5,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/blog\\",\\"icon_font\\":null,\\"position\\":4,\\"title\\":\\"Blog\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":9,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":6,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/contact\\",\\"icon_font\\":null,\\"position\\":5,\\"title\\":\\"Contact\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}}]","menu_id":"1","title":"Contact","url":"\\/","icon_font":null,"css_class":null,"target":"_self","locations":["main-menu"],"submitter":"apply","language":"en_US","status":"published"}', 'updated', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '127.0.0.1', 1, 'Botble\\ACL\\Models\\User', 1, 'Home', 'primary', '2025-12-30 03:07:08', '2025-12-30 03:07:08'),
	(16, 1, 'Botble\\ACL\\Models\\User', 'menunode', '{"name":"Main Menu","deleted_nodes":"2 3 4","menu_nodes":"[{\\"menuItem\\":{\\"id\\":1,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":1,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/home\\",\\"icon_font\\":null,\\"position\\":0,\\"title\\":\\"Home\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":1,\\"children\\":[]},\\"children\\":[]},{\\"menuItem\\":{\\"id\\":5,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":2,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/services\\",\\"icon_font\\":null,\\"position\\":1,\\"title\\":\\"Services\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":6,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":3,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/projects\\",\\"icon_font\\":null,\\"position\\":2,\\"title\\":\\"Portfolio\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":7,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":4,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/pricing\\",\\"icon_font\\":null,\\"position\\":3,\\"title\\":\\"Pricing\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":8,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":5,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/blog\\",\\"icon_font\\":null,\\"position\\":4,\\"title\\":\\"Blog\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":9,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":6,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/contact\\",\\"icon_font\\":null,\\"position\\":5,\\"title\\":\\"Contact\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}}]","menu_id":"1","title":"Contact","url":"\\/","icon_font":null,"css_class":null,"target":"_self","locations":["main-menu"],"submitter":"apply","language":"en_US","status":"published"}', 'updated', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '127.0.0.1', 1, 'Botble\\ACL\\Models\\User', 5, 'Services', 'primary', '2025-12-30 03:07:08', '2025-12-30 03:07:08'),
	(17, 1, 'Botble\\ACL\\Models\\User', 'menunode', '{"name":"Main Menu","deleted_nodes":"2 3 4","menu_nodes":"[{\\"menuItem\\":{\\"id\\":1,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":1,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/home\\",\\"icon_font\\":null,\\"position\\":0,\\"title\\":\\"Home\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":1,\\"children\\":[]},\\"children\\":[]},{\\"menuItem\\":{\\"id\\":5,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":2,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/services\\",\\"icon_font\\":null,\\"position\\":1,\\"title\\":\\"Services\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":6,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":3,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/projects\\",\\"icon_font\\":null,\\"position\\":2,\\"title\\":\\"Portfolio\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":7,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":4,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/pricing\\",\\"icon_font\\":null,\\"position\\":3,\\"title\\":\\"Pricing\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":8,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":5,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/blog\\",\\"icon_font\\":null,\\"position\\":4,\\"title\\":\\"Blog\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":9,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":6,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/contact\\",\\"icon_font\\":null,\\"position\\":5,\\"title\\":\\"Contact\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}}]","menu_id":"1","title":"Contact","url":"\\/","icon_font":null,"css_class":null,"target":"_self","locations":["main-menu"],"submitter":"apply","language":"en_US","status":"published"}', 'updated', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '127.0.0.1', 1, 'Botble\\ACL\\Models\\User', 6, 'Portfolio', 'primary', '2025-12-30 03:07:08', '2025-12-30 03:07:08'),
	(18, 1, 'Botble\\ACL\\Models\\User', 'menunode', '{"name":"Main Menu","deleted_nodes":"2 3 4","menu_nodes":"[{\\"menuItem\\":{\\"id\\":1,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":1,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/home\\",\\"icon_font\\":null,\\"position\\":0,\\"title\\":\\"Home\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":1,\\"children\\":[]},\\"children\\":[]},{\\"menuItem\\":{\\"id\\":5,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":2,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/services\\",\\"icon_font\\":null,\\"position\\":1,\\"title\\":\\"Services\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":6,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":3,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/projects\\",\\"icon_font\\":null,\\"position\\":2,\\"title\\":\\"Portfolio\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":7,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":4,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/pricing\\",\\"icon_font\\":null,\\"position\\":3,\\"title\\":\\"Pricing\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":8,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":5,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/blog\\",\\"icon_font\\":null,\\"position\\":4,\\"title\\":\\"Blog\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":9,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":6,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/contact\\",\\"icon_font\\":null,\\"position\\":5,\\"title\\":\\"Contact\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}}]","menu_id":"1","title":"Contact","url":"\\/","icon_font":null,"css_class":null,"target":"_self","locations":["main-menu"],"submitter":"apply","language":"en_US","status":"published"}', 'updated', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '127.0.0.1', 1, 'Botble\\ACL\\Models\\User', 7, 'Pricing', 'primary', '2025-12-30 03:07:08', '2025-12-30 03:07:08'),
	(19, 1, 'Botble\\ACL\\Models\\User', 'menunode', '{"name":"Main Menu","deleted_nodes":"2 3 4","menu_nodes":"[{\\"menuItem\\":{\\"id\\":1,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":1,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/home\\",\\"icon_font\\":null,\\"position\\":0,\\"title\\":\\"Home\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":1,\\"children\\":[]},\\"children\\":[]},{\\"menuItem\\":{\\"id\\":5,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":2,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/services\\",\\"icon_font\\":null,\\"position\\":1,\\"title\\":\\"Services\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":6,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":3,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/projects\\",\\"icon_font\\":null,\\"position\\":2,\\"title\\":\\"Portfolio\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":7,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":4,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/pricing\\",\\"icon_font\\":null,\\"position\\":3,\\"title\\":\\"Pricing\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":8,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":5,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/blog\\",\\"icon_font\\":null,\\"position\\":4,\\"title\\":\\"Blog\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":9,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":6,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/contact\\",\\"icon_font\\":null,\\"position\\":5,\\"title\\":\\"Contact\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}}]","menu_id":"1","title":"Contact","url":"\\/","icon_font":null,"css_class":null,"target":"_self","locations":["main-menu"],"submitter":"apply","language":"en_US","status":"published"}', 'updated', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '127.0.0.1', 1, 'Botble\\ACL\\Models\\User', 8, 'Blog', 'primary', '2025-12-30 03:07:08', '2025-12-30 03:07:08'),
	(20, 1, 'Botble\\ACL\\Models\\User', 'menunode', '{"name":"Main Menu","deleted_nodes":"2 3 4","menu_nodes":"[{\\"menuItem\\":{\\"id\\":1,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":1,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/home\\",\\"icon_font\\":null,\\"position\\":0,\\"title\\":\\"Home\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":1,\\"children\\":[]},\\"children\\":[]},{\\"menuItem\\":{\\"id\\":5,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":2,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/services\\",\\"icon_font\\":null,\\"position\\":1,\\"title\\":\\"Services\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":6,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":3,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/projects\\",\\"icon_font\\":null,\\"position\\":2,\\"title\\":\\"Portfolio\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":7,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":4,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/pricing\\",\\"icon_font\\":null,\\"position\\":3,\\"title\\":\\"Pricing\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":8,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":5,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/blog\\",\\"icon_font\\":null,\\"position\\":4,\\"title\\":\\"Blog\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}},{\\"menuItem\\":{\\"id\\":9,\\"menu_id\\":1,\\"parent_id\\":0,\\"reference_id\\":6,\\"reference_type\\":\\"Botble\\\\\\\\Page\\\\\\\\Models\\\\\\\\Page\\",\\"url\\":\\"\\/contact\\",\\"icon_font\\":null,\\"position\\":5,\\"title\\":\\"Contact\\",\\"css_class\\":null,\\"target\\":\\"_self\\",\\"has_child\\":0,\\"children\\":[]}}]","menu_id":"1","title":"Contact","url":"\\/","icon_font":null,"css_class":null,"target":"_self","locations":["main-menu"],"submitter":"apply","language":"en_US","status":"published"}', 'updated', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '127.0.0.1', 1, 'Botble\\ACL\\Models\\User', 9, 'Contact', 'primary', '2025-12-30 03:07:08', '2025-12-30 03:07:08'),
	(21, 1, 'Botble\\ACL\\Models\\User', 'page', '{"name":"Home","model":"Botble\\\\Page\\\\Models\\\\Page","slug":"https:\\/\\/yusufefendi.com","description":null,"content":"<shortcode>[hero-banner style=\\"2\\" title=\\"Specialist &lt;span&gt;{Digital}&lt;\\/span&gt;Polymath\\" subtitle=\\"Hey, I\\u2019m Yusuf Efendi\\" description=\\"Membangun sistem, mengotomatisasi proses, dan mendominasi kompetisi. Saya menggabungkan keahlian teknis Engineering dan AI dengan strategi Digital Marketing berbasis data untuk menciptakan solusi digital yang efisien, scalable, dan berorientasi pada hasil.\\" primary_button_text=\\"Download My CV\\" primary_button_link=\\"\\/storage\\/main\\/resume\\/cv.pdf\\" primary_button_icon=\\"ti ti-download\\" open_primary_link_in_the_new_tab=\\"yes\\" open_secondary_link_in_the_new_tab=\\"no\\" below_button_text=\\"...and more\\" quantity=\\"5\\" name_1=\\"Next.js\\" image_1=\\"1.png\\" name_2=\\"Firebase\\" image_2=\\"2.png\\" name_3=\\"MongoDB\\" image_3=\\"3.png\\" name_4=\\"Node.js\\" image_4=\\"4.png\\" name_5=\\"Tailwind CSS\\" image_5=\\"5.png\\" background_image=\\"code\\/general\\/hero-bg.png\\" background_image_dark=\\"code\\/general\\/hero-bg-dark.png\\" right_image=\\"photo-2025-09-26-19-07-38-1.jpg\\" right_image_shape=\\"code\\/general\\/people-shape.png\\" filter_gray_image_in_dark_mode=\\"yes\\" enable_lazy_loading=\\"no\\"][\\/hero-banner]<\\/shortcode><shortcode>[stats-counter style=\\"2\\" quantity=\\"4\\" label_1=\\"Years Experience\\" icon_1=\\"ti ti-crown\\" count_1=\\"12\\" label_2=\\"Projects Completed\\" icon_2=\\"ti ti-device-desktop\\" count_2=\\"250\\" label_3=\\"Satisfied Clients\\" icon_3=\\"ti ti-heart-spark\\" count_3=\\"680\\" label_4=\\"Awards Winner\\" icon_4=\\"ti ti-award\\" count_4=\\"18\\" background_image=\\"code\\/general\\/static-bg.png\\" enable_lazy_loading=\\"no\\"][\\/stats-counter]<\\/shortcode><shortcode>[expertise-tabs title=\\"My Expertise\\" subtitle=\\"Combining technical engineering skills with AI automation capabilities and data-driven digital marketing strategies to deliver comprehensive, scalable solutions.\\" enable_lazy_loading=\\"yes\\"][\\/expertise-tabs]<\\/shortcode><shortcode>[services style=\\"2\\" title=\\"Designing solutions &lt;span class=\'text-300\'&gt;customized&lt;br&gt;to meet your requirements&lt;\\/span&gt;\\" subtitle=\\"Services\\" service_ids=\\"1,4,5,6,2,3\\" bottom_text=\\"Excited to take on &lt;span class=\'text-dark\'&gt;new projects&lt;\\/span&gt; and collaborate. &lt;br&gt;Let\\\\\'s chat about your ideas. &lt;a href=\'\' class=\'text-primary-2\'&gt;Reach out!&lt;\\/a&gt;\\" enable_lazy_loading=\\"yes\\"][\\/services]<\\/shortcode><shortcode>[experience title=\\"+12 &lt;span&gt;years of&lt;\\/span&gt; passion &lt;span&gt;for &lt;br \\/&gt; programming techniques&lt;\\/span&gt;\\" subtitle=\\"Experience\\" role_title=\\"Senior Software Engineer\\" role_description=\\"Led development of scalable web applications, &lt;span&gt;improving performance&lt;\\/span&gt; and user experience for millions of users. \\\\n Implemented machine learning algorithms to enhance search functionality. \\\\n Collaborated with cross-functional teams to integrate new features seamlessly.\\" experiences_quantity=\\"4\\" experiences_date_1=\\"2018 - Present\\" experiences_title_1=\\"Google\\" experiences_logo_1=\\"code\\/experiences\\/google.png\\" experiences_date_2=\\"2012 - 2015\\" experiences_title_2=\\"Twitter (X)\\" experiences_logo_2=\\"code\\/experiences\\/x.png\\" experiences_date_3=\\"2018 - Present\\" experiences_title_3=\\"Amazon\\" experiences_logo_3=\\"code\\/experiences\\/amazon.png\\" experiences_date_4=\\"2010 - 2012\\" experiences_title_4=\\"Paypal\\" experiences_logo_4=\\"code\\/experiences\\/paypal.png\\" skills_quantity=\\"5\\" skills_name_1=\\"Python\\" skills_name_2=\\"TensorFlow\\" skills_name_3=\\"Angular\\" skills_name_4=\\"Kubernetes\\" skills_name_5=\\"GCP\\" background_image=\\"code\\/general\\/services-bg.png\\" enable_lazy_loading=\\"yes\\"][\\/experience]<\\/shortcode><shortcode>[resume style=\\"2\\" resume_1_title=\\"Education\\" resume_1_title_icon=\\"ti ti-school\\" resume_1_quantity=\\"3\\" resume_1_time_1=\\"2011 - 2013\\" resume_1_title_1=\\"Lulus\\" resume_1_subtitle_1=\\"SMK Teknik Informatika Al-Asiyah\\" resume_1_image_1=\\"464370286-1902198303591946-9062885145854930439-n.jpg\\" resume_1_time_2=\\"2017 - 2018\\" resume_1_title_2=\\"Certification in Web Dev\\" resume_1_subtitle_2=\\"University of Stanford\\" resume_1_time_3=\\"2014 - 2016\\" resume_1_title_3=\\"Advanced UX\\/UI Bootcamp\\" resume_1_subtitle_3=\\"Design Academy\\" resume_1_time_4=\\"2012 - 2013\\" resume_1_title_4=\\"Certification in Graphic Design\\" resume_1_subtitle_4=\\"Coursera\\" resume_2_title=\\"Experience\\" resume_2_title_icon=\\"ti ti-stars\\" resume_2_quantity=\\"4\\" resume_2_time_1=\\"2019 - Present\\" resume_2_title_1=\\"Senior UI\\/UX Designer\\" resume_2_subtitle_1=\\"Leader in Creative team\\" resume_2_time_2=\\"2016 - 2019\\" resume_2_title_2=\\"UI\\/UX Designer\\" resume_2_subtitle_2=\\"Tech Startup\\" resume_2_time_3=\\"2014 - 2016\\" resume_2_title_3=\\"Freelance UI\\/UX Designer\\" resume_2_subtitle_3=\\"Self-Employed\\" resume_2_time_4=\\"2012 - 2014\\" resume_2_title_4=\\"Junior UI Designer\\" resume_2_subtitle_4=\\"Web Solutions team\\" enable_lazy_loading=\\"yes\\"][\\/resume]<\\/shortcode><shortcode>[projects style=\\"2\\" title=\\"My Recent Works\\" subtitle=\\"Projects\\" project_ids=\\"1,2,3,4\\" background_image=\\"code\\/general\\/projects-bg.png\\" enable_lazy_loading=\\"yes\\"][\\/projects]<\\/shortcode><shortcode>[skills style=\\"2\\" title=\\"My Skills\\" subtitle=\\"Projects\\" quantity=\\"9\\" name_1=\\"Next.js\\" image_1=\\"code\\/skills\\/1.png\\" name_2=\\"Firebase\\" image_2=\\"code\\/skills\\/2.png\\" name_3=\\"MongoDB\\" image_3=\\"code\\/skills\\/3.png\\" name_4=\\"Node.js\\" image_4=\\"code\\/skills\\/4.png\\" name_5=\\"Tailwind CSS\\" image_5=\\"code\\/skills\\/5.png\\" name_6=\\"React\\" image_6=\\"code\\/skills\\/6.png\\" name_7=\\"Vue.js\\" image_7=\\"code\\/skills\\/7.png\\" name_8=\\"Angular\\" image_8=\\"code\\/skills\\/8.png\\" name_9=\\"Laravel\\" image_9=\\"code\\/skills\\/9.png\\" list_quantity=\\"5\\" list_label_1=\\"Front-End\\" list_content_1=\\"HTML, CSS, JavaScript, React, Angular\\" list_label_2=\\"Back-End\\" list_content_2=\\"Node.js, Express, Python, Django\\" list_label_3=\\"Databases\\" list_content_3=\\"MySQL, PostgreSQL, MongoDB\\" list_label_4=\\"Tools &amp; Platforms\\" list_content_4=\\"Git, Docker, AWS, Heroku\\" list_label_5=\\"Others\\" list_content_5=\\"RESTful APIs, GraphQL, Agile Methodologies\\" enable_lazy_loading=\\"yes\\"][\\/skills]<\\/shortcode><shortcode>[blog-posts style=\\"2\\" paginate=\\"3\\" title=\\"Recent blog\\" subtitle=\\"Latest Posts\\" enable_lazy_loading=\\"yes\\"][\\/blog-posts]<\\/shortcode><shortcode>[contact-form style=\\"2\\" display_fields=\\"phone,email,subject,address\\" mandatory_fields=\\"email,subject\\" title=\\"Let\'s connect\\" quantity=\\"4\\" label_1=\\"Phone\\" content_1=\\"+1-234-567-8901\\" icon_1=\\"ti ti-phone\\" url_1=\\"tel:+1-234-567-8901\\" label_2=\\"Email\\" content_2=\\"contact@botble.com\\" icon_2=\\"ti ti-mail\\" url_2=\\"mailto:contact@botble.com\\" label_3=\\"X (Twitter)\\" content_3=\\"Botble Technologies\\" icon_3=\\"ti ti-user\\" url_3=\\"https:\\/\\/x.com\\/botble\\" label_4=\\"Address\\" content_4=\\"0811 Erdman Prairie, Joaville CA\\" icon_4=\\"ti ti-map\\" url_4=\\"https:\\/\\/google.com\\/maps\\"][\\/contact-form]<\\/shortcode>","gallery":null,"submitter":"apply","status":"published","template":"default","image":null}', 'updated', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '127.0.0.1', 1, 'Botble\\ACL\\Models\\User', 1, 'Home', 'primary', '2025-12-30 10:21:51', '2025-12-30 10:21:51'),
	(22, 1, 'Botble\\ACL\\Models\\User', 'to the system', NULL, 'logged in', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '127.0.0.1', 1, 'Botble\\ACL\\Models\\User', 1, 'Yusuf Efendi', 'info', '2025-12-31 06:08:25', '2025-12-31 06:08:25'),
	(23, 1, 'Botble\\ACL\\Models\\User', 'to the system', NULL, 'logged in', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '127.0.0.1', 1, 'Botble\\ACL\\Models\\User', 1, 'Yusuf Efendi', 'info', '2025-12-31 06:08:25', '2025-12-31 06:08:25'),
	(24, 1, 'Botble\\ACL\\Models\\User', 'to the system', NULL, 'logged in', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '127.0.0.1', 1, 'Botble\\ACL\\Models\\User', 1, 'Yusuf Efendi', 'info', '2025-12-31 06:08:25', '2025-12-31 06:08:25'),
	(25, 1, 'Botble\\ACL\\Models\\User', 'page', '{"name":"Home","model":"Botble\\\\Page\\\\Models\\\\Page","slug":"https:\\/\\/yusufefendi.com","description":null,"content":"<shortcode>[hero-banner style=\\"2\\" title=\\"Specialist &lt;span&gt;{Digital}&lt;\\/span&gt;Polymath\\" subtitle=\\"Hey, I\\u2019m Yusuf Efendi\\" description=\\"Membangun sistem, mengotomatisasi proses, dan mendominasi kompetisi. Saya menggabungkan keahlian teknis Engineering dan AI dengan strategi Digital Marketing berbasis data untuk menciptakan solusi digital yang efisien, scalable, dan berorientasi pada hasil.\\" primary_button_text=\\"Download My CV\\" primary_button_link=\\"\\/storage\\/main\\/resume\\/cv.pdf\\" primary_button_icon=\\"ti ti-download\\" open_primary_link_in_the_new_tab=\\"yes\\" open_secondary_link_in_the_new_tab=\\"no\\" below_button_text=\\"...and more\\" quantity=\\"5\\" name_1=\\"Next.js\\" image_1=\\"1.png\\" name_2=\\"Firebase\\" image_2=\\"2.png\\" name_3=\\"MongoDB\\" image_3=\\"3.png\\" name_4=\\"Node.js\\" image_4=\\"4.png\\" name_5=\\"Tailwind CSS\\" image_5=\\"5.png\\" background_image=\\"code\\/general\\/hero-bg.png\\" background_image_dark=\\"code\\/general\\/hero-bg-dark.png\\" right_image=\\"photo-2025-09-26-19-07-38-1.jpg\\" right_image_shape=\\"code\\/general\\/people-shape.png\\" filter_gray_image_in_dark_mode=\\"yes\\" enable_lazy_loading=\\"no\\"][\\/hero-banner]<\\/shortcode><shortcode>[stats-counter style=\\"2\\" quantity=\\"4\\" label_1=\\"Years Experience\\" icon_1=\\"ti ti-crown\\" count_1=\\"12\\" label_2=\\"Projects Completed\\" icon_2=\\"ti ti-device-desktop\\" count_2=\\"250\\" label_3=\\"Satisfied Clients\\" icon_3=\\"ti ti-heart-spark\\" count_3=\\"680\\" label_4=\\"Awards Winner\\" icon_4=\\"ti ti-award\\" count_4=\\"18\\" background_image=\\"code\\/general\\/static-bg.png\\" enable_lazy_loading=\\"no\\"][\\/stats-counter]<\\/shortcode><shortcode>[expertise-tabs title=\\"My Expertise\\" subtitle=\\"Combining technical engineering skills with AI automation capabilities and data-driven digital marketing strategies to deliver comprehensive, scalable solutions.\\" enable_lazy_loading=\\"yes\\"][\\/expertise-tabs]<\\/shortcode><shortcode>[services style=\\"2\\" title=\\"Designing solutions &lt;span class=\'text-300\'&gt;customized&lt;br&gt;to meet your requirements&lt;\\/span&gt;\\" subtitle=\\"Services\\" service_ids=\\"1,4,5,6,2,3\\" bottom_text=\\"Excited to take on &lt;span class=\'text-dark\'&gt;new projects&lt;\\/span&gt; and collaborate. &lt;br&gt;Let\\\\\'s chat about your ideas. &lt;a href=\'\' class=\'text-primary-2\'&gt;Reach out!&lt;\\/a&gt;\\" enable_lazy_loading=\\"yes\\"][\\/services]<\\/shortcode><shortcode>[experience title=\\"+12 &lt;span&gt;years of&lt;\\/span&gt; passion &lt;span&gt;for &lt;br \\/&gt; programming techniques&lt;\\/span&gt;\\" subtitle=\\"Experience\\" role_title=\\"Senior Software Engineer\\" role_description=\\"Led development of scalable web applications, &lt;span&gt;improving performance&lt;\\/span&gt; and user experience for millions of users. \\\\n Implemented machine learning algorithms to enhance search functionality. \\\\n Collaborated with cross-functional teams to integrate new features seamlessly.\\" experiences_quantity=\\"4\\" experiences_date_1=\\"2018 - Present\\" experiences_title_1=\\"Google\\" experiences_logo_1=\\"code\\/experiences\\/google.png\\" experiences_date_2=\\"2012 - 2015\\" experiences_title_2=\\"Twitter (X)\\" experiences_logo_2=\\"code\\/experiences\\/x.png\\" experiences_date_3=\\"2018 - Present\\" experiences_title_3=\\"Amazon\\" experiences_logo_3=\\"code\\/experiences\\/amazon.png\\" experiences_date_4=\\"2010 - 2012\\" experiences_title_4=\\"Paypal\\" experiences_logo_4=\\"code\\/experiences\\/paypal.png\\" skills_quantity=\\"5\\" skills_name_1=\\"Python\\" skills_name_2=\\"TensorFlow\\" skills_name_3=\\"Angular\\" skills_name_4=\\"Kubernetes\\" skills_name_5=\\"GCP\\" background_image=\\"code\\/general\\/services-bg.png\\" enable_lazy_loading=\\"yes\\"][\\/experience]<\\/shortcode><shortcode>[resume style=\\"2\\" resume_1_title=\\"Education\\" resume_1_title_icon=\\"ti ti-school\\" resume_1_quantity=\\"3\\" resume_1_time_1=\\"2011 - 2013\\" resume_1_title_1=\\"Lulus\\" resume_1_subtitle_1=\\"SMK Teknik Informatika Al-Asiyah\\" resume_1_image_1=\\"464370286-1902198303591946-9062885145854930439-n.jpg\\" resume_1_time_2=\\"2017 - 2018\\" resume_1_title_2=\\"Certification in Web Dev\\" resume_1_subtitle_2=\\"University of Stanford\\" resume_1_time_3=\\"2014 - 2016\\" resume_1_title_3=\\"Advanced UX\\/UI Bootcamp\\" resume_1_subtitle_3=\\"Design Academy\\" resume_1_time_4=\\"2012 - 2013\\" resume_1_title_4=\\"Certification in Graphic Design\\" resume_1_subtitle_4=\\"Coursera\\" resume_2_title=\\"Experience\\" resume_2_title_icon=\\"ti ti-stars\\" resume_2_quantity=\\"4\\" resume_2_time_1=\\"2019 - Present\\" resume_2_title_1=\\"Senior UI\\/UX Designer\\" resume_2_subtitle_1=\\"Leader in Creative team\\" resume_2_time_2=\\"2016 - 2019\\" resume_2_title_2=\\"UI\\/UX Designer\\" resume_2_subtitle_2=\\"Tech Startup\\" resume_2_time_3=\\"2014 - 2016\\" resume_2_title_3=\\"Freelance UI\\/UX Designer\\" resume_2_subtitle_3=\\"Self-Employed\\" resume_2_time_4=\\"2012 - 2014\\" resume_2_title_4=\\"Junior UI Designer\\" resume_2_subtitle_4=\\"Web Solutions team\\" enable_lazy_loading=\\"yes\\"][\\/resume]<\\/shortcode><shortcode>[projects style=\\"2\\" title=\\"My Recent Works\\" subtitle=\\"Projects\\" project_ids=\\"1,2,3,4\\" background_image=\\"code\\/general\\/projects-bg.png\\" enable_lazy_loading=\\"yes\\"][\\/projects]<\\/shortcode><shortcode>[skills style=\\"2\\" title=\\"My Skills\\" subtitle=\\"Projects\\" quantity=\\"9\\" name_1=\\"Next.js\\" image_1=\\"nextjs.png\\" level_1=\\"90%\\" name_2=\\"Firebase\\" image_2=\\"firebase.jpg\\" level_2=\\"89%\\" name_3=\\"MongoDB\\" image_3=\\"mongodb.jpg\\" level_3=\\"85%\\" name_4=\\"Node.js\\" image_4=\\"nodejs.png\\" level_4=\\"92%\\" name_5=\\"Tailwind CSS\\" image_5=\\"code\\/skills\\/5.png\\" name_6=\\"React\\" image_6=\\"code\\/skills\\/6.png\\" name_7=\\"Vue.js\\" image_7=\\"code\\/skills\\/7.png\\" name_8=\\"Angular\\" image_8=\\"code\\/skills\\/8.png\\" name_9=\\"Laravel\\" image_9=\\"code\\/skills\\/9.png\\" list_quantity=\\"5\\" list_label_1=\\"Front-End\\" list_content_1=\\"HTML, CSS, JavaScript, React, Angular\\" list_label_2=\\"Back-End\\" list_content_2=\\"Node.js, Express, Python, Django\\" list_label_3=\\"Databases\\" list_content_3=\\"MySQL, PostgreSQL, MongoDB\\" list_label_4=\\"Tools &amp; Platforms\\" list_content_4=\\"Git, Docker, AWS, Heroku\\" list_label_5=\\"Others\\" list_content_5=\\"RESTful APIs, GraphQL, Agile Methodologies\\" enable_lazy_loading=\\"yes\\"][\\/skills]<\\/shortcode><shortcode>[blog-posts style=\\"2\\" paginate=\\"3\\" title=\\"Recent blog\\" subtitle=\\"Latest Posts\\" enable_lazy_loading=\\"yes\\"][\\/blog-posts]<\\/shortcode><shortcode>[contact-form style=\\"2\\" display_fields=\\"phone,email,subject,address\\" mandatory_fields=\\"email,subject\\" title=\\"Let\'s connect\\" quantity=\\"4\\" label_1=\\"Phone\\" content_1=\\"+1-234-567-8901\\" icon_1=\\"ti ti-phone\\" url_1=\\"tel:+1-234-567-8901\\" label_2=\\"Email\\" content_2=\\"contact@botble.com\\" icon_2=\\"ti ti-mail\\" url_2=\\"mailto:contact@botble.com\\" label_3=\\"X (Twitter)\\" content_3=\\"Botble Technologies\\" icon_3=\\"ti ti-user\\" url_3=\\"https:\\/\\/x.com\\/botble\\" label_4=\\"Address\\" content_4=\\"0811 Erdman Prairie, Joaville CA\\" icon_4=\\"ti ti-map\\" url_4=\\"https:\\/\\/google.com\\/maps\\"][\\/contact-form]<\\/shortcode>","gallery":null,"submitter":"apply","status":"published","template":"default","image":null}', 'updated', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '127.0.0.1', 1, 'Botble\\ACL\\Models\\User', 1, 'Home', 'primary', '2025-12-31 07:08:43', '2025-12-31 07:08:43'),
	(26, 1, 'Botble\\ACL\\Models\\User', 'page', '{"name":"Home","model":"Botble\\\\Page\\\\Models\\\\Page","slug":"https:\\/\\/yusufefendi.com","description":null,"content":"<shortcode>[hero-banner style=\\"2\\" title=\\"Specialist &lt;span&gt;{Digital}&lt;\\/span&gt;Polymath\\" subtitle=\\"Hey, I\\u2019m Yusuf Efendi\\" description=\\"Membangun sistem, mengotomatisasi proses, dan mendominasi kompetisi. Saya menggabungkan keahlian teknis Engineering dan AI dengan strategi Digital Marketing berbasis data untuk menciptakan solusi digital yang efisien, scalable, dan berorientasi pada hasil.\\" primary_button_text=\\"Download My CV\\" primary_button_link=\\"\\/storage\\/main\\/resume\\/cv.pdf\\" primary_button_icon=\\"ti ti-download\\" open_primary_link_in_the_new_tab=\\"yes\\" open_secondary_link_in_the_new_tab=\\"no\\" below_button_text=\\"...and more\\" quantity=\\"5\\" name_1=\\"Next.js\\" image_1=\\"1.png\\" name_2=\\"Firebase\\" image_2=\\"2.png\\" name_3=\\"MongoDB\\" image_3=\\"3.png\\" name_4=\\"Node.js\\" image_4=\\"4.png\\" name_5=\\"Tailwind CSS\\" image_5=\\"5.png\\" background_image=\\"code\\/general\\/hero-bg.png\\" background_image_dark=\\"code\\/general\\/hero-bg-dark.png\\" right_image=\\"photo-2025-09-26-19-07-38-1.jpg\\" right_image_shape=\\"code\\/general\\/people-shape.png\\" filter_gray_image_in_dark_mode=\\"yes\\" enable_lazy_loading=\\"no\\"][\\/hero-banner]<\\/shortcode><shortcode>[stats-counter style=\\"2\\" quantity=\\"4\\" label_1=\\"Years Experience\\" icon_1=\\"ti ti-crown\\" count_1=\\"12\\" label_2=\\"Projects Completed\\" icon_2=\\"ti ti-device-desktop\\" count_2=\\"250\\" label_3=\\"Satisfied Clients\\" icon_3=\\"ti ti-heart-spark\\" count_3=\\"680\\" label_4=\\"Awards Winner\\" icon_4=\\"ti ti-award\\" count_4=\\"18\\" background_image=\\"code\\/general\\/static-bg.png\\" enable_lazy_loading=\\"no\\"][\\/stats-counter]<\\/shortcode><shortcode>[expertise-tabs title=\\"My Expertise\\" subtitle=\\"Combining technical engineering skills with AI automation capabilities and data-driven digital marketing strategies to deliver comprehensive, scalable solutions.\\" enable_lazy_loading=\\"yes\\"][\\/expertise-tabs]<\\/shortcode><shortcode>[services style=\\"2\\" title=\\"Designing solutions &lt;span class=\'text-300\'&gt;customized&lt;br&gt;to meet your requirements&lt;\\/span&gt;\\" subtitle=\\"Services\\" service_ids=\\"1,4,5,6,2,3\\" bottom_text=\\"Excited to take on &lt;span class=\'text-dark\'&gt;new projects&lt;\\/span&gt; and collaborate. &lt;br&gt;Let\\\\\'s chat about your ideas. &lt;a href=\'\' class=\'text-primary-2\'&gt;Reach out!&lt;\\/a&gt;\\" enable_lazy_loading=\\"yes\\"][\\/services]<\\/shortcode><shortcode>[experience title=\\"+12 &lt;span&gt;years of&lt;\\/span&gt; passion &lt;span&gt;for &lt;br \\/&gt; programming techniques&lt;\\/span&gt;\\" subtitle=\\"Experience\\" role_title=\\"Senior Software Engineer\\" role_description=\\"Led development of scalable web applications, &lt;span&gt;improving performance&lt;\\/span&gt; and user experience for millions of users. \\\\n Implemented machine learning algorithms to enhance search functionality. \\\\n Collaborated with cross-functional teams to integrate new features seamlessly.\\" experiences_quantity=\\"4\\" experiences_date_1=\\"2018 - Present\\" experiences_title_1=\\"Google\\" experiences_logo_1=\\"code\\/experiences\\/google.png\\" experiences_date_2=\\"2012 - 2015\\" experiences_title_2=\\"Twitter (X)\\" experiences_logo_2=\\"code\\/experiences\\/x.png\\" experiences_date_3=\\"2018 - Present\\" experiences_title_3=\\"Amazon\\" experiences_logo_3=\\"code\\/experiences\\/amazon.png\\" experiences_date_4=\\"2010 - 2012\\" experiences_title_4=\\"Paypal\\" experiences_logo_4=\\"code\\/experiences\\/paypal.png\\" skills_quantity=\\"5\\" skills_name_1=\\"Python\\" skills_name_2=\\"TensorFlow\\" skills_name_3=\\"Angular\\" skills_name_4=\\"Kubernetes\\" skills_name_5=\\"GCP\\" background_image=\\"code\\/general\\/services-bg.png\\" enable_lazy_loading=\\"yes\\"][\\/experience]<\\/shortcode><shortcode>[resume style=\\"2\\" resume_1_title=\\"Education\\" resume_1_title_icon=\\"ti ti-school\\" resume_1_quantity=\\"3\\" resume_1_time_1=\\"2011 - 2013\\" resume_1_title_1=\\"Lulus\\" resume_1_subtitle_1=\\"SMK Teknik Informatika Al-Asiyah\\" resume_1_image_1=\\"464370286-1902198303591946-9062885145854930439-n.jpg\\" resume_1_time_2=\\"2017 - 2018\\" resume_1_title_2=\\"Certification in Web Dev\\" resume_1_subtitle_2=\\"University of Stanford\\" resume_1_time_3=\\"2014 - 2016\\" resume_1_title_3=\\"Advanced UX\\/UI Bootcamp\\" resume_1_subtitle_3=\\"Design Academy\\" resume_1_time_4=\\"2012 - 2013\\" resume_1_title_4=\\"Certification in Graphic Design\\" resume_1_subtitle_4=\\"Coursera\\" resume_2_title=\\"Experience\\" resume_2_title_icon=\\"ti ti-stars\\" resume_2_quantity=\\"4\\" resume_2_time_1=\\"2019 - Present\\" resume_2_title_1=\\"Senior UI\\/UX Designer\\" resume_2_subtitle_1=\\"Leader in Creative team\\" resume_2_time_2=\\"2016 - 2019\\" resume_2_title_2=\\"UI\\/UX Designer\\" resume_2_subtitle_2=\\"Tech Startup\\" resume_2_time_3=\\"2014 - 2016\\" resume_2_title_3=\\"Freelance UI\\/UX Designer\\" resume_2_subtitle_3=\\"Self-Employed\\" resume_2_time_4=\\"2012 - 2014\\" resume_2_title_4=\\"Junior UI Designer\\" resume_2_subtitle_4=\\"Web Solutions team\\" enable_lazy_loading=\\"yes\\"][\\/resume]<\\/shortcode><shortcode>[projects style=\\"2\\" title=\\"My Recent Works\\" subtitle=\\"Projects\\" project_ids=\\"1,2,3,4\\" background_image=\\"code\\/general\\/projects-bg.png\\" enable_lazy_loading=\\"yes\\"][\\/projects]<\\/shortcode><shortcode>[skills style=\\"2\\" title=\\"My Skills\\" subtitle=\\"Projects\\" quantity=\\"9\\" name_1=\\"Next.js\\" image_1=\\"nextjs-1.png\\" level_1=\\"90%\\" name_2=\\"Firebase\\" image_2=\\"firebase-1.png\\" level_2=\\"89%\\" name_3=\\"MongoDB\\" image_3=\\"mongodb-1.png\\" level_3=\\"85%\\" name_4=\\"Node.js\\" image_4=\\"nodejs.png\\" level_4=\\"92%\\" name_5=\\"Tailwind CSS\\" image_5=\\"tailwind-css-logo-rounded-free-png.webp\\" name_6=\\"React\\" image_6=\\"1183672.png\\" name_7=\\"Vue.js\\" image_7=\\"vuejs.png\\" name_8=\\"Angular\\" image_8=\\"angular.png\\" name_9=\\"Laravel\\" image_9=\\"laravel.png\\" list_quantity=\\"5\\" list_label_1=\\"Front-End\\" list_content_1=\\"HTML, CSS, JavaScript, React, Angular\\" list_label_2=\\"Back-End\\" list_content_2=\\"Node.js, Express, Python, Django\\" list_label_3=\\"Databases\\" list_content_3=\\"MySQL, PostgreSQL, MongoDB\\" list_label_4=\\"Tools &amp; Platforms\\" list_content_4=\\"Git, Docker, AWS, Heroku\\" list_label_5=\\"Others\\" list_content_5=\\"RESTful APIs, GraphQL, Agile Methodologies\\" enable_lazy_loading=\\"yes\\"][\\/skills]<\\/shortcode><shortcode>[blog-posts style=\\"2\\" paginate=\\"3\\" title=\\"Recent blog\\" subtitle=\\"Latest Posts\\" enable_lazy_loading=\\"yes\\"][\\/blog-posts]<\\/shortcode><shortcode>[contact-form style=\\"2\\" display_fields=\\"phone,email,subject,address\\" mandatory_fields=\\"email,subject\\" title=\\"Let\'s connect\\" quantity=\\"4\\" label_1=\\"Phone\\" content_1=\\"+1-234-567-8901\\" icon_1=\\"ti ti-phone\\" url_1=\\"tel:+1-234-567-8901\\" label_2=\\"Email\\" content_2=\\"contact@botble.com\\" icon_2=\\"ti ti-mail\\" url_2=\\"mailto:contact@botble.com\\" label_3=\\"X (Twitter)\\" content_3=\\"Botble Technologies\\" icon_3=\\"ti ti-user\\" url_3=\\"https:\\/\\/x.com\\/botble\\" label_4=\\"Address\\" content_4=\\"0811 Erdman Prairie, Joaville CA\\" icon_4=\\"ti ti-map\\" url_4=\\"https:\\/\\/google.com\\/maps\\"][\\/contact-form]<\\/shortcode>","gallery":null,"submitter":"apply","status":"published","template":"default","image":null}', 'updated', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '127.0.0.1', 1, 'Botble\\ACL\\Models\\User', 1, 'Home', 'primary', '2025-12-31 07:19:00', '2025-12-31 07:19:00'),
	(27, 1, 'Botble\\ACL\\Models\\User', 'page', '{"name":"Home","model":"Botble\\\\Page\\\\Models\\\\Page","slug":"https:\\/\\/yusufefendi.com","description":null,"content":"<shortcode>[hero-banner style=\\"2\\" title=\\"Specialist &lt;span&gt;{Digital}&lt;\\/span&gt;Polymath\\" subtitle=\\"Hey, I\\u2019m Yusuf Efendi\\" description=\\"Membangun sistem, mengotomatisasi proses, dan mendominasi kompetisi. Saya menggabungkan keahlian teknis Engineering dan AI dengan strategi Digital Marketing berbasis data untuk menciptakan solusi digital yang efisien, scalable, dan berorientasi pada hasil.\\" primary_button_text=\\"Download My CV\\" primary_button_link=\\"\\/storage\\/main\\/resume\\/cv.pdf\\" primary_button_icon=\\"ti ti-download\\" open_primary_link_in_the_new_tab=\\"yes\\" open_secondary_link_in_the_new_tab=\\"no\\" below_button_text=\\"...and more\\" quantity=\\"5\\" name_1=\\"Next.js\\" image_1=\\"1.png\\" name_2=\\"Firebase\\" image_2=\\"2.png\\" name_3=\\"MongoDB\\" image_3=\\"3.png\\" name_4=\\"Node.js\\" image_4=\\"4.png\\" name_5=\\"Tailwind CSS\\" image_5=\\"5.png\\" background_image=\\"code\\/general\\/hero-bg.png\\" background_image_dark=\\"code\\/general\\/hero-bg-dark.png\\" right_image=\\"photo-2025-09-26-19-07-38-1.jpg\\" right_image_shape=\\"code\\/general\\/people-shape.png\\" filter_gray_image_in_dark_mode=\\"yes\\" enable_lazy_loading=\\"no\\"][\\/hero-banner]<\\/shortcode><shortcode>[stats-counter style=\\"2\\" quantity=\\"4\\" label_1=\\"Years Experience\\" icon_1=\\"ti ti-crown\\" count_1=\\"12\\" label_2=\\"Projects Completed\\" icon_2=\\"ti ti-device-desktop\\" count_2=\\"250\\" label_3=\\"Satisfied Clients\\" icon_3=\\"ti ti-heart-spark\\" count_3=\\"680\\" label_4=\\"Awards Winner\\" icon_4=\\"ti ti-award\\" count_4=\\"18\\" background_image=\\"code\\/general\\/static-bg.png\\" enable_lazy_loading=\\"no\\"][\\/stats-counter]<\\/shortcode><shortcode>[expertise-tabs title=\\"My Expertise\\" subtitle=\\"Combining technical engineering skills with AI automation capabilities and data-driven digital marketing strategies to deliver comprehensive, scalable solutions.\\" enable_lazy_loading=\\"yes\\"][\\/expertise-tabs]<\\/shortcode><shortcode>[services style=\\"2\\" title=\\"Designing solutions &lt;span class=\'text-300\'&gt;customized&lt;br&gt;to meet your requirements&lt;\\/span&gt;\\" subtitle=\\"Services\\" service_ids=\\"1,4,5,6,2,3\\" bottom_text=\\"Excited to take on &lt;span class=\'text-dark\'&gt;new projects&lt;\\/span&gt; and collaborate. &lt;br&gt;Let\\\\\'s chat about your ideas. &lt;a href=\'\' class=\'text-primary-2\'&gt;Reach out!&lt;\\/a&gt;\\" enable_lazy_loading=\\"yes\\"][\\/services]<\\/shortcode><shortcode>[experience title=\\"+12 &lt;span&gt;years of&lt;\\/span&gt; passion &lt;span&gt;for &lt;br \\/&gt; programming techniques&lt;\\/span&gt;\\" subtitle=\\"Experience\\" role_title=\\"Senior Software Engineer\\" role_description=\\"Led development of scalable web applications, &lt;span&gt;improving performance&lt;\\/span&gt; and user experience for millions of users. \\\\n Implemented machine learning algorithms to enhance search functionality. \\\\n Collaborated with cross-functional teams to integrate new features seamlessly.\\" experiences_quantity=\\"4\\" experiences_date_1=\\"2018 - Present\\" experiences_title_1=\\"Google\\" experiences_logo_1=\\"code\\/experiences\\/google.png\\" experiences_date_2=\\"2012 - 2015\\" experiences_title_2=\\"Twitter (X)\\" experiences_logo_2=\\"code\\/experiences\\/x.png\\" experiences_date_3=\\"2018 - Present\\" experiences_title_3=\\"Amazon\\" experiences_logo_3=\\"code\\/experiences\\/amazon.png\\" experiences_date_4=\\"2010 - 2012\\" experiences_title_4=\\"Paypal\\" experiences_logo_4=\\"code\\/experiences\\/paypal.png\\" skills_quantity=\\"5\\" skills_name_1=\\"Python\\" skills_name_2=\\"TensorFlow\\" skills_name_3=\\"Angular\\" skills_name_4=\\"Kubernetes\\" skills_name_5=\\"GCP\\" background_image=\\"code\\/general\\/services-bg.png\\" enable_lazy_loading=\\"yes\\"][\\/experience]<\\/shortcode><shortcode>[resume style=\\"2\\" resume_1_title=\\"Education\\" resume_1_title_icon=\\"ti ti-school\\" resume_1_quantity=\\"3\\" resume_1_time_1=\\"2011 - 2013\\" resume_1_title_1=\\"Lulus\\" resume_1_subtitle_1=\\"SMK Teknik Informatika Al-Asiyah\\" resume_1_image_1=\\"464370286-1902198303591946-9062885145854930439-n.jpg\\" resume_1_time_2=\\"2017 - 2018\\" resume_1_title_2=\\"Certification in Web Dev\\" resume_1_subtitle_2=\\"University of Stanford\\" resume_1_time_3=\\"2014 - 2016\\" resume_1_title_3=\\"Advanced UX\\/UI Bootcamp\\" resume_1_subtitle_3=\\"Design Academy\\" resume_1_time_4=\\"2012 - 2013\\" resume_1_title_4=\\"Certification in Graphic Design\\" resume_1_subtitle_4=\\"Coursera\\" resume_2_title=\\"Experience\\" resume_2_title_icon=\\"ti ti-stars\\" resume_2_quantity=\\"4\\" resume_2_time_1=\\"2019 - Present\\" resume_2_title_1=\\"Senior UI\\/UX Designer\\" resume_2_subtitle_1=\\"Leader in Creative team\\" resume_2_time_2=\\"2016 - 2019\\" resume_2_title_2=\\"UI\\/UX Designer\\" resume_2_subtitle_2=\\"Tech Startup\\" resume_2_time_3=\\"2014 - 2016\\" resume_2_title_3=\\"Freelance UI\\/UX Designer\\" resume_2_subtitle_3=\\"Self-Employed\\" resume_2_time_4=\\"2012 - 2014\\" resume_2_title_4=\\"Junior UI Designer\\" resume_2_subtitle_4=\\"Web Solutions team\\" enable_lazy_loading=\\"yes\\"][\\/resume]<\\/shortcode><shortcode>[projects style=\\"2\\" title=\\"My Recent Works\\" subtitle=\\"Projects\\" project_ids=\\"1,2,3,4\\" background_image=\\"code\\/general\\/projects-bg.png\\" enable_lazy_loading=\\"yes\\"][\\/projects]<\\/shortcode><shortcode>[skills style=\\"2\\" title=\\"My Skills\\" subtitle=\\"Projects\\" quantity=\\"9\\" name_1=\\"Next.js\\" image_1=\\"nextjs-1.png\\" level_1=\\"90%\\" name_2=\\"Firebase\\" image_2=\\"firebase-1.png\\" level_2=\\"89%\\" name_3=\\"MongoDB\\" image_3=\\"mongodb-1.png\\" level_3=\\"85%\\" name_4=\\"Node.js\\" image_4=\\"nodejs.png\\" level_4=\\"92%\\" name_5=\\"Tailwind CSS\\" image_5=\\"tailwind-css-logo-rounded-free-png.webp\\" name_6=\\"React\\" image_6=\\"1183672.png\\" name_7=\\"Vue.js\\" image_7=\\"vuejs.png\\" name_8=\\"Angular\\" image_8=\\"angular.png\\" name_9=\\"Laravel\\" image_9=\\"laravel.png\\" list_quantity=\\"5\\" list_label_1=\\"Front-End\\" list_content_1=\\"HTML, CSS, JavaScript, React, Angular\\" list_label_2=\\"Back-End\\" list_content_2=\\"Node.js, Express, Python, Django\\" list_label_3=\\"Databases\\" list_content_3=\\"MySQL, PostgreSQL, MongoDB\\" list_label_4=\\"Tools &amp; Platforms\\" list_content_4=\\"Git, Docker, AWS, Heroku\\" list_label_5=\\"Others\\" list_content_5=\\"RESTful APIs, GraphQL, Agile Methodologies\\" enable_lazy_loading=\\"yes\\"][\\/skills]<\\/shortcode><shortcode>[blog-posts style=\\"2\\" paginate=\\"3\\" title=\\"Recent blog\\" subtitle=\\"Latest Posts\\" enable_lazy_loading=\\"yes\\"][\\/blog-posts]<\\/shortcode><shortcode>[contact-form style=\\"2\\" display_fields=\\"phone,email,subject,address\\" mandatory_fields=\\"email,subject\\" title=\\"Let\'s connect\\" quantity=\\"4\\" label_1=\\"Phone\\" content_1=\\"+1-234-567-8901\\" icon_1=\\"ti ti-phone\\" url_1=\\"tel:+1-234-567-8901\\" label_2=\\"Email\\" content_2=\\"contact@botble.com\\" icon_2=\\"ti ti-mail\\" url_2=\\"mailto:contact@botble.com\\" label_3=\\"X (Twitter)\\" content_3=\\"Botble Technologies\\" icon_3=\\"ti ti-user\\" url_3=\\"https:\\/\\/x.com\\/botble\\" label_4=\\"Address\\" content_4=\\"0811 Erdman Prairie, Joaville CA\\" icon_4=\\"ti ti-map\\" url_4=\\"https:\\/\\/google.com\\/maps\\"][\\/contact-form]<\\/shortcode>","gallery":null,"submitter":"apply","status":"published","template":"default","image":null}', 'updated', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '127.0.0.1', 1, 'Botble\\ACL\\Models\\User', 1, 'Home', 'primary', '2025-12-31 07:19:43', '2025-12-31 07:19:43'),
	(28, 1, 'Botble\\ACL\\Models\\User', 'page', '{"name":"Home","model":"Botble\\\\Page\\\\Models\\\\Page","slug":"https:\\/\\/yusufefendi.com","description":null,"content":"<shortcode>[hero-banner style=\\"2\\" title=\\"Specialist &lt;span&gt;{Digital}&lt;\\/span&gt;Polymath\\" subtitle=\\"Hey, I\\u2019m Yusuf Efendi\\" description=\\"Membangun sistem, mengotomatisasi proses, dan mendominasi kompetisi. Saya menggabungkan keahlian teknis Engineering dan AI dengan strategi Digital Marketing berbasis data untuk menciptakan solusi digital yang efisien, scalable, dan berorientasi pada hasil.\\" primary_button_text=\\"Download My CV\\" primary_button_link=\\"\\/storage\\/main\\/resume\\/cv.pdf\\" primary_button_icon=\\"ti ti-download\\" open_primary_link_in_the_new_tab=\\"yes\\" open_secondary_link_in_the_new_tab=\\"no\\" below_button_text=\\"...and more\\" quantity=\\"5\\" name_1=\\"Next.js\\" image_1=\\"1.png\\" name_2=\\"Firebase\\" image_2=\\"2.png\\" name_3=\\"MongoDB\\" image_3=\\"3.png\\" name_4=\\"Node.js\\" image_4=\\"4.png\\" name_5=\\"Tailwind CSS\\" image_5=\\"5.png\\" background_image=\\"code\\/general\\/hero-bg.png\\" background_image_dark=\\"code\\/general\\/hero-bg-dark.png\\" right_image=\\"photo-2025-09-26-19-07-38-1.jpg\\" right_image_shape=\\"code\\/general\\/people-shape.png\\" filter_gray_image_in_dark_mode=\\"yes\\" enable_lazy_loading=\\"no\\"][\\/hero-banner]<\\/shortcode><shortcode>[stats-counter style=\\"2\\" quantity=\\"4\\" label_1=\\"Years Experience\\" icon_1=\\"ti ti-crown\\" count_1=\\"12\\" label_2=\\"Projects Completed\\" icon_2=\\"ti ti-device-desktop\\" count_2=\\"250\\" label_3=\\"Satisfied Clients\\" icon_3=\\"ti ti-heart-spark\\" count_3=\\"680\\" label_4=\\"Awards Winner\\" icon_4=\\"ti ti-award\\" count_4=\\"18\\" background_image=\\"code\\/general\\/static-bg.png\\" enable_lazy_loading=\\"no\\"][\\/stats-counter]<\\/shortcode><shortcode>[expertise-tabs title=\\"My Expertise\\" subtitle=\\"Combining technical engineering skills with AI automation capabilities and data-driven digital marketing strategies to deliver comprehensive, scalable solutions.\\" enable_lazy_loading=\\"yes\\"][\\/expertise-tabs]<\\/shortcode><shortcode>[services style=\\"2\\" title=\\"Designing solutions &lt;span class=\'text-300\'&gt;customized&lt;br&gt;to meet your requirements&lt;\\/span&gt;\\" subtitle=\\"Services\\" service_ids=\\"1,4,5,6,2,3\\" bottom_text=\\"Excited to take on &lt;span class=\'text-dark\'&gt;new projects&lt;\\/span&gt; and collaborate. &lt;br&gt;Let\\\\\'s chat about your ideas. &lt;a href=\'\' class=\'text-primary-2\'&gt;Reach out!&lt;\\/a&gt;\\" enable_lazy_loading=\\"yes\\"][\\/services]<\\/shortcode><shortcode>[experience title=\\"+12 &lt;span&gt;years of&lt;\\/span&gt; passion &lt;span&gt;for &lt;br \\/&gt; programming techniques&lt;\\/span&gt;\\" subtitle=\\"Experience\\" role_title=\\"Senior Software Engineer\\" role_description=\\"Led development of scalable web applications, &lt;span&gt;improving performance&lt;\\/span&gt; and user experience for millions of users. \\r\\n Implemented machine learning algorithms to enhance search functionality. \\r\\n Collaborated with cross-functional teams to integrate new features seamlessly.\\" experiences_quantity=\\"4\\" experiences_date_1=\\"2020- Present\\" experiences_title_1=\\"Digital Creative Solution\\" experiences_logo_1=\\"icon-1.png\\" experiences_date_2=\\"2018 - 2020\\" experiences_title_2=\\"Haribima IT Consultant\\" experiences_logo_2=\\"haribimait.png\\" experiences_date_3=\\"2017 - 2018\\" experiences_title_3=\\"IT Development\\" experiences_logo_3=\\"itd.png\\" experiences_date_4=\\"2016 - 2017\\" experiences_title_4=\\"Haribima IT Consultant\\" experiences_logo_4=\\"haribimait.png\\" skills_quantity=\\"5\\" skills_name_1=\\"Python\\" skills_name_2=\\"TensorFlow\\" skills_name_3=\\"Angular\\" skills_name_4=\\"Kubernetes\\" skills_name_5=\\"GCP\\" background_image=\\"code\\/general\\/services-bg.png\\" enable_lazy_loading=\\"yes\\"][\\/experience]<\\/shortcode><shortcode>[resume style=\\"2\\" resume_1_title=\\"Education\\" resume_1_title_icon=\\"ti ti-school\\" resume_1_quantity=\\"3\\" resume_1_time_1=\\"2011 - 2013\\" resume_1_title_1=\\"Lulus\\" resume_1_subtitle_1=\\"SMK Teknik Informatika Al-Asiyah\\" resume_1_image_1=\\"464370286-1902198303591946-9062885145854930439-n.jpg\\" resume_1_time_2=\\"2017 - 2018\\" resume_1_title_2=\\"Certification in Web Dev\\" resume_1_subtitle_2=\\"University of Stanford\\" resume_1_time_3=\\"2014 - 2016\\" resume_1_title_3=\\"Advanced UX\\/UI Bootcamp\\" resume_1_subtitle_3=\\"Design Academy\\" resume_1_time_4=\\"2012 - 2013\\" resume_1_title_4=\\"Certification in Graphic Design\\" resume_1_subtitle_4=\\"Coursera\\" resume_2_title=\\"Experience\\" resume_2_title_icon=\\"ti ti-stars\\" resume_2_quantity=\\"4\\" resume_2_time_1=\\"2019 - Present\\" resume_2_title_1=\\"Senior UI\\/UX Designer\\" resume_2_subtitle_1=\\"Leader in Creative team\\" resume_2_time_2=\\"2016 - 2019\\" resume_2_title_2=\\"UI\\/UX Designer\\" resume_2_subtitle_2=\\"Tech Startup\\" resume_2_time_3=\\"2014 - 2016\\" resume_2_title_3=\\"Freelance UI\\/UX Designer\\" resume_2_subtitle_3=\\"Self-Employed\\" resume_2_time_4=\\"2012 - 2014\\" resume_2_title_4=\\"Junior UI Designer\\" resume_2_subtitle_4=\\"Web Solutions team\\" enable_lazy_loading=\\"yes\\"][\\/resume]<\\/shortcode><shortcode>[projects style=\\"2\\" title=\\"My Recent Works\\" subtitle=\\"Projects\\" project_ids=\\"1,2,3,4\\" background_image=\\"code\\/general\\/projects-bg.png\\" enable_lazy_loading=\\"yes\\"][\\/projects]<\\/shortcode><shortcode>[skills style=\\"2\\" title=\\"My Skills\\" subtitle=\\"Projects\\" quantity=\\"9\\" name_1=\\"Next.js\\" image_1=\\"nextjs-1.png\\" level_1=\\"90%\\" name_2=\\"Firebase\\" image_2=\\"firebase-1.png\\" level_2=\\"89%\\" name_3=\\"MongoDB\\" image_3=\\"mongodb-1.png\\" level_3=\\"85%\\" name_4=\\"Node.js\\" image_4=\\"nodejs.png\\" level_4=\\"92%\\" name_5=\\"Tailwind CSS\\" image_5=\\"tailwind-css-logo-rounded-free-png.webp\\" name_6=\\"React\\" image_6=\\"1183672.png\\" name_7=\\"Vue.js\\" image_7=\\"vuejs.png\\" name_8=\\"Angular\\" image_8=\\"angular.png\\" name_9=\\"Laravel\\" image_9=\\"laravel.png\\" list_quantity=\\"5\\" list_label_1=\\"Front-End\\" list_content_1=\\"HTML, CSS, JavaScript, React, Angular\\" list_label_2=\\"Back-End\\" list_content_2=\\"Node.js, Express, Python, Django\\" list_label_3=\\"Databases\\" list_content_3=\\"MySQL, PostgreSQL, MongoDB\\" list_label_4=\\"Tools &amp; Platforms\\" list_content_4=\\"Git, Docker, AWS, Heroku\\" list_label_5=\\"Others\\" list_content_5=\\"RESTful APIs, GraphQL, Agile Methodologies\\" enable_lazy_loading=\\"yes\\"][\\/skills]<\\/shortcode><shortcode>[blog-posts style=\\"2\\" paginate=\\"3\\" title=\\"Recent blog\\" subtitle=\\"Latest Posts\\" enable_lazy_loading=\\"yes\\"][\\/blog-posts]<\\/shortcode><shortcode>[contact-form style=\\"2\\" display_fields=\\"phone,email,subject,address\\" mandatory_fields=\\"email,subject\\" title=\\"Let\'s connect\\" quantity=\\"4\\" label_1=\\"Phone\\" content_1=\\"+1-234-567-8901\\" icon_1=\\"ti ti-phone\\" url_1=\\"tel:+1-234-567-8901\\" label_2=\\"Email\\" content_2=\\"contact@botble.com\\" icon_2=\\"ti ti-mail\\" url_2=\\"mailto:contact@botble.com\\" label_3=\\"X (Twitter)\\" content_3=\\"Botble Technologies\\" icon_3=\\"ti ti-user\\" url_3=\\"https:\\/\\/x.com\\/botble\\" label_4=\\"Address\\" content_4=\\"0811 Erdman Prairie, Joaville CA\\" icon_4=\\"ti ti-map\\" url_4=\\"https:\\/\\/google.com\\/maps\\"][\\/contact-form]<\\/shortcode>","gallery":null,"submitter":"apply","status":"published","template":"default","image":null}', 'updated', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '127.0.0.1', 1, 'Botble\\ACL\\Models\\User', 1, 'Home', 'primary', '2025-12-31 07:27:34', '2025-12-31 07:27:34'),
	(29, 1, 'Botble\\ACL\\Models\\User', 'page', '{"name":"Home","model":"Botble\\\\Page\\\\Models\\\\Page","slug":"https:\\/\\/yusufefendi.com","description":null,"content":"<shortcode>[hero-banner style=\\"2\\" title=\\"Specialist &lt;span&gt;{Digital}&lt;\\/span&gt;Polymath\\" subtitle=\\"Hey, I\\u2019m Yusuf Efendi\\" description=\\"Membangun sistem, mengotomatisasi proses, dan mendominasi kompetisi. Saya menggabungkan keahlian teknis Engineering dan AI dengan strategi Digital Marketing berbasis data untuk menciptakan solusi digital yang efisien, scalable, dan berorientasi pada hasil.\\" primary_button_text=\\"Download My CV\\" primary_button_link=\\"\\/storage\\/main\\/resume\\/cv.pdf\\" primary_button_icon=\\"ti ti-download\\" open_primary_link_in_the_new_tab=\\"yes\\" open_secondary_link_in_the_new_tab=\\"no\\" below_button_text=\\"...and more\\" quantity=\\"5\\" name_1=\\"Next.js\\" image_1=\\"1.png\\" name_2=\\"Firebase\\" image_2=\\"2.png\\" name_3=\\"MongoDB\\" image_3=\\"3.png\\" name_4=\\"Node.js\\" image_4=\\"4.png\\" name_5=\\"Tailwind CSS\\" image_5=\\"5.png\\" background_image=\\"code\\/general\\/hero-bg.png\\" background_image_dark=\\"code\\/general\\/hero-bg-dark.png\\" right_image=\\"photo-2025-09-26-19-07-38-1.jpg\\" right_image_shape=\\"code\\/general\\/people-shape.png\\" filter_gray_image_in_dark_mode=\\"yes\\" enable_lazy_loading=\\"no\\"][\\/hero-banner]<\\/shortcode><shortcode>[stats-counter style=\\"2\\" quantity=\\"4\\" label_1=\\"Years Experience\\" icon_1=\\"ti ti-crown\\" count_1=\\"12\\" label_2=\\"Projects Completed\\" icon_2=\\"ti ti-device-desktop\\" count_2=\\"250\\" label_3=\\"Satisfied Clients\\" icon_3=\\"ti ti-heart-spark\\" count_3=\\"680\\" label_4=\\"Awards Winner\\" icon_4=\\"ti ti-award\\" count_4=\\"18\\" background_image=\\"code\\/general\\/static-bg.png\\" enable_lazy_loading=\\"no\\"][\\/stats-counter]<\\/shortcode><shortcode>[expertise-tabs title=\\"My Expertise\\" subtitle=\\"Combining technical engineering skills with AI automation capabilities and data-driven digital marketing strategies to deliver comprehensive, scalable solutions.\\" enable_lazy_loading=\\"yes\\"][\\/expertise-tabs]<\\/shortcode><shortcode>[experience title=\\"+12 &lt;span&gt;years of&lt;\\/span&gt; passion &lt;span&gt;for &lt;br \\/&gt; programming techniques&lt;\\/span&gt;\\" subtitle=\\"Experience\\" role_title=\\"Senior Software Engineer\\" role_description=\\"Led development of scalable web applications, &lt;span&gt;improving performance&lt;\\/span&gt; and user experience for millions of users. Implemented machine learning algorithms to enhance search functionality. Collaborated with cross-functional teams to integrate new features seamlessly.\\" experiences_quantity=\\"4\\" experiences_date_1=\\"2020- Present\\" experiences_title_1=\\"Digital Creative Solution\\" experiences_logo_1=\\"icon-1.png\\" experiences_date_2=\\"2018 - 2020\\" experiences_title_2=\\"Haribima IT Consultant\\" experiences_logo_2=\\"haribimait.png\\" experiences_date_3=\\"2017 - 2018\\" experiences_title_3=\\"IT Development\\" experiences_logo_3=\\"itd.png\\" experiences_date_4=\\"2016 - 2017\\" experiences_title_4=\\"Haribima IT Consultant\\" experiences_logo_4=\\"haribimait.png\\" skills_quantity=\\"5\\" skills_name_1=\\"Python\\" skills_name_2=\\"TensorFlow\\" skills_name_3=\\"Angular\\" skills_name_4=\\"Kubernetes\\" skills_name_5=\\"GCP\\" background_image=\\"code\\/general\\/services-bg.png\\" enable_lazy_loading=\\"yes\\"][\\/experience]<\\/shortcode><shortcode>[resume style=\\"2\\" resume_1_title=\\"Education\\" resume_1_title_icon=\\"ti ti-school\\" resume_1_quantity=\\"3\\" resume_1_time_1=\\"2011 - 2013\\" resume_1_title_1=\\"Lulus\\" resume_1_subtitle_1=\\"SMK Teknik Informatika Al-Asiyah\\" resume_1_image_1=\\"464370286-1902198303591946-9062885145854930439-n.jpg\\" resume_1_time_2=\\"2017 - 2018\\" resume_1_title_2=\\"Certification in Web Dev\\" resume_1_subtitle_2=\\"University of Stanford\\" resume_1_time_3=\\"2014 - 2016\\" resume_1_title_3=\\"Advanced UX\\/UI Bootcamp\\" resume_1_subtitle_3=\\"Design Academy\\" resume_1_time_4=\\"2012 - 2013\\" resume_1_title_4=\\"Certification in Graphic Design\\" resume_1_subtitle_4=\\"Coursera\\" resume_2_title=\\"Experience\\" resume_2_title_icon=\\"ti ti-stars\\" resume_2_quantity=\\"4\\" resume_2_time_1=\\"2019 - Present\\" resume_2_title_1=\\"Senior UI\\/UX Designer\\" resume_2_subtitle_1=\\"Leader in Creative team\\" resume_2_time_2=\\"2016 - 2019\\" resume_2_title_2=\\"UI\\/UX Designer\\" resume_2_subtitle_2=\\"Tech Startup\\" resume_2_time_3=\\"2014 - 2016\\" resume_2_title_3=\\"Freelance UI\\/UX Designer\\" resume_2_subtitle_3=\\"Self-Employed\\" resume_2_time_4=\\"2012 - 2014\\" resume_2_title_4=\\"Junior UI Designer\\" resume_2_subtitle_4=\\"Web Solutions team\\" enable_lazy_loading=\\"yes\\"][\\/resume]<\\/shortcode><shortcode>[projects style=\\"2\\" title=\\"My Recent Works\\" subtitle=\\"Projects\\" project_ids=\\"1,2,3,4\\" background_image=\\"code\\/general\\/projects-bg.png\\" enable_lazy_loading=\\"yes\\"][\\/projects]<\\/shortcode><shortcode>[skills style=\\"2\\" title=\\"My Skills\\" subtitle=\\"Projects\\" quantity=\\"9\\" name_1=\\"Next.js\\" image_1=\\"nextjs-1.png\\" level_1=\\"90%\\" name_2=\\"Firebase\\" image_2=\\"firebase-1.png\\" level_2=\\"89%\\" name_3=\\"MongoDB\\" image_3=\\"mongodb-1.png\\" level_3=\\"85%\\" name_4=\\"Node.js\\" image_4=\\"nodejs.png\\" level_4=\\"92%\\" name_5=\\"Tailwind CSS\\" image_5=\\"tailwind-css-logo-rounded-free-png.webp\\" name_6=\\"React\\" image_6=\\"1183672.png\\" name_7=\\"Vue.js\\" image_7=\\"vuejs.png\\" name_8=\\"Angular\\" image_8=\\"angular.png\\" name_9=\\"Laravel\\" image_9=\\"laravel.png\\" list_quantity=\\"5\\" list_label_1=\\"Front-End\\" list_content_1=\\"HTML, CSS, JavaScript, React, Angular\\" list_label_2=\\"Back-End\\" list_content_2=\\"Node.js, Express, Python, Django\\" list_label_3=\\"Databases\\" list_content_3=\\"MySQL, PostgreSQL, MongoDB\\" list_label_4=\\"Tools &amp; Platforms\\" list_content_4=\\"Git, Docker, AWS, Heroku\\" list_label_5=\\"Others\\" list_content_5=\\"RESTful APIs, GraphQL, Agile Methodologies\\" enable_lazy_loading=\\"yes\\"][\\/skills]<\\/shortcode><shortcode>[blog-posts style=\\"2\\" paginate=\\"3\\" title=\\"Recent blog\\" subtitle=\\"Latest Posts\\" enable_lazy_loading=\\"yes\\"][\\/blog-posts]<\\/shortcode><shortcode>[contact-form style=\\"2\\" display_fields=\\"phone,email,subject,address\\" mandatory_fields=\\"email,subject\\" title=\\"Let\'s connect\\" quantity=\\"4\\" label_1=\\"Phone\\" content_1=\\"+1-234-567-8901\\" icon_1=\\"ti ti-phone\\" url_1=\\"tel:+1-234-567-8901\\" label_2=\\"Email\\" content_2=\\"contact@botble.com\\" icon_2=\\"ti ti-mail\\" url_2=\\"mailto:contact@botble.com\\" label_3=\\"X (Twitter)\\" content_3=\\"Botble Technologies\\" icon_3=\\"ti ti-user\\" url_3=\\"https:\\/\\/x.com\\/botble\\" label_4=\\"Address\\" content_4=\\"0811 Erdman Prairie, Joaville CA\\" icon_4=\\"ti ti-map\\" url_4=\\"https:\\/\\/google.com\\/maps\\"][\\/contact-form]<\\/shortcode>","gallery":null,"submitter":"apply","status":"published","template":"default","image":null}', 'updated', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '127.0.0.1', 1, 'Botble\\ACL\\Models\\User', 1, 'Home', 'primary', '2025-12-31 07:30:26', '2025-12-31 07:30:26');

-- membuang struktur untuk table ucuy.cache
CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.cache: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.cache_locks
CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.cache_locks: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` bigint unsigned NOT NULL DEFAULT '0',
  `description` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `author_id` bigint unsigned DEFAULT NULL,
  `author_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Botble\\ACL\\Models\\User',
  `icon` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order` int unsigned NOT NULL DEFAULT '0',
  `is_featured` tinyint NOT NULL DEFAULT '0',
  `is_default` tinyint unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `categories_parent_id_index` (`parent_id`),
  KEY `categories_status_index` (`status`),
  KEY `categories_created_at_index` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.categories: ~9 rows (lebih kurang)
INSERT INTO `categories` (`id`, `name`, `parent_id`, `description`, `status`, `author_id`, `author_type`, `icon`, `order`, `is_featured`, `is_default`, `created_at`, `updated_at`) VALUES
	(1, 'Web Development', 0, 'Modi sapiente accusantium optio ipsum culpa aut. Quod animi rerum soluta tenetur labore sed. Minus excepturi nulla possimus pariatur mollitia soluta non.', 'published', 1, 'Botble\\ACL\\Models\\User', NULL, 0, 0, 0, '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(2, 'Open Source Contributions', 0, 'Eaque veritatis doloribus a porro doloremque est perspiciatis. Non et ducimus perferendis aut non. Quidem quia beatae velit et aut aperiam. Non ea animi deleniti voluptatem.', 'published', 1, 'Botble\\ACL\\Models\\User', NULL, 0, 1, 0, '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(3, 'Tutorials', 0, 'Et debitis unde animi temporibus quia esse. Ut iusto commodi exercitationem accusantium aut in et qui. Totam libero repellendus fuga vero. Delectus aliquid quia fuga.', 'published', 1, 'Botble\\ACL\\Models\\User', NULL, 0, 1, 0, '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(4, 'Technology Reviews', 0, 'Est atque eligendi ratione officia eveniet beatae. Vel labore autem quis vitae aut ut corporis quo. Minus ad architecto quis qui provident vero. Laboriosam repellendus quis aperiam et.', 'published', 1, 'Botble\\ACL\\Models\\User', NULL, 0, 1, 0, '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(5, 'Personal Blog', 0, 'Recusandae quis inventore eum error voluptas. Voluptatem dolores a totam nulla.', 'published', 1, 'Botble\\ACL\\Models\\User', NULL, 0, 1, 0, '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(6, 'Career Journey', 0, 'Fuga consequatur ratione vel dolor. Voluptate tenetur enim qui ab eum aliquid aut. Eius qui commodi id atque accusamus. Eos deleniti quod aut.', 'published', 1, 'Botble\\ACL\\Models\\User', NULL, 0, 1, 0, '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(7, 'Coding Challenges', 0, 'Asperiores accusamus illum molestiae nulla consequatur. Qui iusto accusantium facere omnis adipisci.', 'published', 1, 'Botble\\ACL\\Models\\User', NULL, 0, 1, 0, '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(8, 'Design Portfolio', 0, 'Aut consequatur occaecati eum totam at. Assumenda quo doloremque sit laboriosam accusantium dicta. Enim tempore corporis voluptatem. Velit beatae architecto natus omnis sit molestias.', 'published', 1, 'Botble\\ACL\\Models\\User', NULL, 0, 1, 0, '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(9, 'Collaborations', 0, 'Velit sed soluta voluptate nam. Quo reiciendis totam placeat consequatur reiciendis. Laudantium eum deleniti eos sed aut nihil. Unde dolorem est esse vero est voluptatem neque.', 'published', 1, 'Botble\\ACL\\Models\\User', NULL, 0, 1, 0, '2025-09-11 19:44:28', '2025-09-11 19:44:28');

-- membuang struktur untuk table ucuy.categories_translations
CREATE TABLE IF NOT EXISTS `categories_translations` (
  `lang_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `categories_id` bigint unsigned NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`lang_code`,`categories_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.categories_translations: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.contact_custom_field_options
CREATE TABLE IF NOT EXISTS `contact_custom_field_options` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `custom_field_id` bigint unsigned NOT NULL,
  `label` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `value` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order` int NOT NULL DEFAULT '999',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.contact_custom_field_options: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.contact_custom_field_options_translations
CREATE TABLE IF NOT EXISTS `contact_custom_field_options_translations` (
  `contact_custom_field_options_id` bigint unsigned NOT NULL,
  `lang_code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `value` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`lang_code`,`contact_custom_field_options_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.contact_custom_field_options_translations: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.contact_custom_fields
CREATE TABLE IF NOT EXISTS `contact_custom_fields` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `required` tinyint(1) NOT NULL DEFAULT '0',
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `placeholder` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order` int NOT NULL DEFAULT '999',
  `status` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.contact_custom_fields: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.contact_custom_fields_translations
CREATE TABLE IF NOT EXISTS `contact_custom_fields_translations` (
  `contact_custom_fields_id` bigint unsigned NOT NULL,
  `lang_code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `placeholder` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`lang_code`,`contact_custom_fields_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.contact_custom_fields_translations: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.contact_replies
CREATE TABLE IF NOT EXISTS `contact_replies` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `message` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.contact_replies: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.contacts
CREATE TABLE IF NOT EXISTS `contacts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `custom_fields` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unread',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.contacts: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.dashboard_widget_settings
CREATE TABLE IF NOT EXISTS `dashboard_widget_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `settings` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `user_id` bigint unsigned NOT NULL,
  `widget_id` bigint unsigned NOT NULL,
  `order` tinyint unsigned NOT NULL DEFAULT '0',
  `status` tinyint unsigned NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dashboard_widget_settings_user_id_index` (`user_id`),
  KEY `dashboard_widget_settings_widget_id_index` (`widget_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.dashboard_widget_settings: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.dashboard_widgets
CREATE TABLE IF NOT EXISTS `dashboard_widgets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.dashboard_widgets: ~7 rows (lebih kurang)
INSERT INTO `dashboard_widgets` (`id`, `name`, `created_at`, `updated_at`) VALUES
	(1, 'widget_total_themes', '2025-11-26 08:19:52', '2025-11-26 08:19:52'),
	(2, 'widget_total_users', '2025-11-26 08:19:52', '2025-11-26 08:19:52'),
	(3, 'widget_total_plugins', '2025-11-26 08:19:52', '2025-11-26 08:19:52'),
	(4, 'widget_total_pages', '2025-11-26 08:19:52', '2025-11-26 08:19:52'),
	(5, 'widget_posts_recent', '2025-11-26 08:19:52', '2025-11-26 08:19:52'),
	(6, 'widget_audit_logs', '2025-11-26 08:19:53', '2025-11-26 08:19:53'),
	(7, 'widget_request_errors', '2025-11-26 08:19:53', '2025-11-26 08:19:53');

-- membuang struktur untuk table ucuy.device_tokens
CREATE TABLE IF NOT EXISTS `device_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `token` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `platform` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `app_version` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `last_used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `device_tokens_token_unique` (`token`),
  KEY `device_tokens_user_type_user_id_index` (`user_type`,`user_id`),
  KEY `device_tokens_platform_is_active_index` (`platform`,`is_active`),
  KEY `device_tokens_is_active_index` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.device_tokens: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.failed_jobs
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.failed_jobs: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.faq_categories
CREATE TABLE IF NOT EXISTS `faq_categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order` tinyint NOT NULL DEFAULT '0',
  `status` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `description` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.faq_categories: ~3 rows (lebih kurang)
INSERT INTO `faq_categories` (`id`, `name`, `order`, `status`, `created_at`, `updated_at`, `description`) VALUES
	(1, 'Service Offerings', 0, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30', NULL),
	(2, 'Cost and Billing', 1, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30', NULL),
	(3, 'Follow-Up Support', 2, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30', NULL);

-- membuang struktur untuk table ucuy.faq_categories_translations
CREATE TABLE IF NOT EXISTS `faq_categories_translations` (
  `lang_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `faq_categories_id` bigint unsigned NOT NULL,
  `name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`lang_code`,`faq_categories_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.faq_categories_translations: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.faqs
CREATE TABLE IF NOT EXISTS `faqs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `question` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  `status` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.faqs: ~18 rows (lebih kurang)
INSERT INTO `faqs` (`id`, `question`, `answer`, `category_id`, `status`, `created_at`, `updated_at`) VALUES
	(1, 'What is business consulting?', 'Business consulting involves providing expert advice to organizations to help them improve their performance and achieve their business objectives.', 1, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(2, 'How can consulting services benefit my business?', 'Consulting services can provide insights, strategies, and solutions to address specific challenges, improve efficiency, enhance decision-making, and ultimately contribute to the overall success of your business.', 2, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(3, 'What specific services do you provide?', 'We offer a range of services, including strategic planning, financial advisory, operations optimization, market research, and more. Our goal is to tailor our services to meet the unique needs of each client.', 2, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(4, 'How do you structure your fees?', 'Our fees are structured based on the scope and complexity of the project. We offer different pricing models, including hourly rates, project-based fees, and retainer agreements. The specific fee structure will be discussed and agreed upon during the initial consultation.', 2, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(5, 'What industries do you specialize in?', 'We have experience and expertise across various industries, including but not limited to technology, finance, healthcare, and manufacturing. Our consultants work closely with clients to understand industry-specific challenges and provide tailored solutions.', 1, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(6, 'Can you share any client testimonials or case studies?', 'Certainly! We have a collection of client testimonials and case studies that highlight the success stories of our consulting engagements. Please visit our \'Client Success Stories\' section for more details.', 3, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(7, 'How do you collaborate with clients during the consulting process?', 'We believe in a collaborative approach. Throughout the consulting process, we maintain open communication with our clients, involve key stakeholders, and ensure that the client\'s perspective is integral to the decision-making process.', 3, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(8, 'How long does a typical consulting engagement last?', 'The duration of a consulting engagement varies depending on the nature and scope of the project. During the initial consultation, we work with clients to define the timeline and milestones for the project, ensuring alignment with their goals and objectives.', 2, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(9, 'Who are the key members of your consulting team?', 'Our consulting team consists of highly qualified and experienced professionals with diverse backgrounds. You can learn more about our team members on the \'Meet the Team\' page of our website.', 1, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(10, 'How do you handle client information and sensitive data?', 'We take data privacy and confidentiality seriously. Our firm adheres to strict security protocols to protect client information. We have established measures to ensure the confidentiality and security of sensitive data throughout the consulting process.', 3, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(11, 'Is there ongoing support after the consulting engagement?', 'Yes, we provide ongoing support to our clients even after the completion of the consulting engagement. This may include follow-up meetings, additional training, and assistance with the implementation of recommended strategies to ensure sustained success.', 3, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(12, 'What is your policy regarding cancellations?', 'Our cancellation policy is outlined in the consulting agreement. Generally, we require advance notice for cancellations, and any associated fees or refunds will be discussed and agreed upon during the initial engagement negotiations.', 2, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(13, 'What is your approach to sustainability consulting?', 'In sustainability consulting, we work with clients to develop environmentally responsible and socially conscious business practices. Our approach involves assessing current operations, identifying areas for improvement, and implementing sustainable strategies to reduce environmental impact and promote corporate social responsibility.', 2, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(14, 'Do you offer remote consulting services?', 'Yes, we offer remote consulting services to clients worldwide. Our team is equipped to conduct virtual meetings, collaborate online, and deliver effective consulting services remotely. This allows us to work with clients regardless of geographical location.', 3, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(15, 'How can your technology integration services benefit my business?', 'Our technology integration services focus on streamlining business processes through the effective use of technology. By integrating the right technologies, we help businesses enhance efficiency, improve communication, and stay competitive in today\'s rapidly evolving digital landscape.', 1, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(16, 'What sets your leadership development programs apart?', 'Our leadership development programs are designed to empower individuals at all levels of an organization. We go beyond traditional training, focusing on personalized coaching, mentorship, and experiential learning to cultivate effective and inspiring leaders within your company.', 3, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(17, 'How do you stay updated on industry trends and best practices?', 'We are committed to staying at the forefront of industry trends and best practices. Our team actively engages in continuous learning, participates in relevant conferences, and maintains a strong network of industry professionals to ensure that our consulting services are informed by the latest insights and innovations.', 3, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(18, 'What measures do you take to ensure the quality of your consulting services?', 'We prioritize the quality of our consulting services by implementing rigorous quality assurance processes. This includes regular reviews of our methodologies, ongoing training for our consultants, and soliciting feedback from clients to continuously improve our service delivery.', 3, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30');

-- membuang struktur untuk table ucuy.faqs_translations
CREATE TABLE IF NOT EXISTS `faqs_translations` (
  `lang_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `faqs_id` bigint unsigned NOT NULL,
  `question` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `answer` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`lang_code`,`faqs_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.faqs_translations: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.fob_comments
CREATE TABLE IF NOT EXISTS `fob_comments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reply_to` bigint unsigned DEFAULT NULL,
  `author_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_id` bigint unsigned DEFAULT NULL,
  `reference_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` bigint unsigned DEFAULT NULL,
  `reference_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fob_comments_author_type_author_id_index` (`author_type`,`author_id`),
  KEY `fob_comments_reference_type_reference_id_index` (`reference_type`,`reference_id`),
  KEY `fob_comments_reply_to_index` (`reply_to`),
  KEY `fob_comments_reference_url_index` (`reference_url`),
  KEY `fob_comments_status_index` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.fob_comments: ~47 rows (lebih kurang)
INSERT INTO `fob_comments` (`id`, `reply_to`, `author_type`, `author_id`, `reference_type`, `reference_id`, `reference_url`, `name`, `email`, `website`, `content`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
	(1, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 10, 'http://zelio.test', 'Alyce Marks', 'vyost@dare.com', 'https://friendsofbotble.com', 'This is really helpful, thank you!', 'approved', '126.136.57.254', 'Opera/8.51 (X11; Linux i686; sl-SI) Presto/2.9.288 Version/12.00', '2025-08-24 05:51:55', '2025-09-11 19:44:37'),
	(2, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 3, 'http://zelio.test', 'Prof. Rosalinda Hudson V', 'alysa18@zemlak.com', 'https://friendsofbotble.com', 'I found this article to be quite informative.', 'approved', '201.221.248.172', 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_5_5) AppleWebKit/535.2 (KHTML, like Gecko) Chrome/93.0.4006.11 Safari/535.2 Edg/93.01081.85', '2025-09-09 02:02:17', '2025-09-11 19:44:37'),
	(3, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 10, 'http://zelio.test', 'Dr. Brannon Medhurst DDS', 'colin.white@effertz.biz', 'https://friendsofbotble.com', 'Wow, I never knew about this before!', 'approved', '133.218.1.192', 'Opera/8.10 (Windows 95; sl-SI) Presto/2.8.315 Version/10.00', '2025-09-05 22:51:13', '2025-09-11 19:44:37'),
	(4, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 2, 'http://zelio.test', 'Nelda Fahey', 'zachery.mayer@dubuque.com', 'https://friendsofbotble.com', 'Great job on explaining such a complex topic.', 'approved', '163.213.174.248', 'Mozilla/5.0 (compatible; MSIE 6.0; Windows NT 4.0; Trident/5.0)', '2025-08-18 06:51:43', '2025-09-11 19:44:37'),
	(5, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 14, 'http://zelio.test', 'Jarret Batz', 'kale27@osinski.com', 'https://friendsofbotble.com', 'I have a question about the third paragraph.', 'approved', '69.192.146.87', 'Opera/8.59 (X11; Linux i686; nl-NL) Presto/2.9.305 Version/10.00', '2025-09-05 15:43:20', '2025-09-11 19:44:37'),
	(6, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 7, 'http://zelio.test', 'Thalia Wiegand', 'dolson@yahoo.com', 'https://friendsofbotble.com', 'This article changed my perspective entirely.', 'approved', '206.8.209.211', 'Mozilla/5.0 (compatible; MSIE 6.0; Windows 98; Win 9x 4.90; Trident/3.1)', '2025-08-29 23:20:17', '2025-09-11 19:44:37'),
	(7, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 6, 'http://zelio.test', 'Anya Schultz', 'lkoss@yahoo.com', 'https://friendsofbotble.com', 'I appreciate the effort you put into this.', 'approved', '30.148.59.104', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3 rv:4.0; en-US) AppleWebKit/531.4.5 (KHTML, like Gecko) Version/4.0.5 Safari/531.4.5', '2025-08-26 06:18:21', '2025-09-11 19:44:37'),
	(8, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 1, 'http://zelio.test', 'Tessie Powlowski III', 'sunny65@gmail.com', 'https://friendsofbotble.com', 'This is exactly what I was looking for, thank you!', 'approved', '184.203.121.107', 'Opera/9.75 (X11; Linux i686; sl-SI) Presto/2.9.194 Version/11.00', '2025-08-27 17:08:57', '2025-09-11 19:44:37'),
	(9, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 1, 'http://zelio.test', 'Orpha Daugherty', 'johnson.stracke@gmail.com', 'https://friendsofbotble.com', 'I disagree with some points mentioned here, though.', 'approved', '142.222.1.150', 'Mozilla/5.0 (Windows 95; en-US; rv:1.9.1.20) Gecko/20241225 Firefox/35.0', '2025-09-05 20:44:50', '2025-09-11 19:44:37'),
	(10, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 12, 'http://zelio.test', 'Prof. Gabrielle Kilback PhD', 'grant.ethel@gmail.com', 'https://friendsofbotble.com', 'Could you provide more examples to illustrate your point?', 'approved', '242.245.238.219', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/5340 (KHTML, like Gecko) Chrome/39.0.830.0 Mobile Safari/5340', '2025-09-02 02:22:59', '2025-09-11 19:44:37'),
	(11, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 6, 'http://zelio.test', 'Dr. Therese Little V', 'tressie22@gmail.com', 'https://friendsofbotble.com', 'I wish there were more articles like this out there.', 'approved', '32.254.217.175', 'Mozilla/5.0 (Windows; U; Windows 98) AppleWebKit/534.34.1 (KHTML, like Gecko) Version/4.0 Safari/534.34.1', '2025-08-19 12:34:41', '2025-09-11 19:44:37'),
	(12, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 15, 'http://zelio.test', 'Estelle Hagenes', 'hills.leola@renner.net', 'https://friendsofbotble.com', 'I\'m bookmarking this for future reference.', 'approved', '188.49.171.2', 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/533.2 (KHTML, like Gecko) Chrome/95.0.4289.37 Safari/533.2 Edg/95.01060.41', '2025-08-12 01:48:45', '2025-09-11 19:44:37'),
	(13, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 3, 'http://zelio.test', 'Winona Waelchi', 'reagan.rau@hotmail.com', 'https://friendsofbotble.com', 'I\'ve shared this with my friends, they loved it!', 'approved', '138.236.27.32', 'Mozilla/5.0 (Windows CE; nl-NL; rv:1.9.0.20) Gecko/20231218 Firefox/35.0', '2025-08-28 11:40:06', '2025-09-11 19:44:37'),
	(14, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 5, 'http://zelio.test', 'Dr. Dessie O\'Conner II', 'michale.mraz@gmail.com', 'https://friendsofbotble.com', 'This article is a must-read for everyone interested in the topic.', 'approved', '55.208.193.41', 'Mozilla/5.0 (X11; Linux x86_64; rv:5.0) Gecko/20250528 Firefox/35.0', '2025-09-01 16:54:32', '2025-09-11 19:44:37'),
	(15, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 8, 'http://zelio.test', 'Mr. Jasen Ward I', 'paucek.leslie@ruecker.org', 'https://friendsofbotble.com', 'Thank you for shedding light on this important issue.', 'approved', '34.55.62.6', 'Mozilla/5.0 (Windows; U; Windows NT 5.0) AppleWebKit/533.42.3 (KHTML, like Gecko) Version/4.0.2 Safari/533.42.3', '2025-09-02 20:32:31', '2025-09-11 19:44:37'),
	(16, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 7, 'http://zelio.test', 'Mrs. Emmy Lesch', 'augustine.raynor@bashirian.com', 'https://friendsofbotble.com', 'I\'ve been searching for information on this topic, glad I found this article.', 'approved', '80.236.175.144', 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 5.01; Trident/3.1)', '2025-09-03 19:49:57', '2025-09-11 19:44:37'),
	(17, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 5, 'http://zelio.test', 'Virginie Legros', 'hartmann.shemar@hotmail.com', 'https://friendsofbotble.com', 'I\'m blown away by the insights shared in this article.', 'approved', '45.139.68.56', 'Opera/9.94 (Windows NT 4.0; en-US) Presto/2.11.164 Version/10.00', '2025-09-03 11:52:20', '2025-09-11 19:44:37'),
	(18, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 2, 'http://zelio.test', 'Florence Beer', 'reichel.eloisa@gmail.com', 'https://friendsofbotble.com', 'This article tackles a complex topic with clarity.', 'approved', '210.121.37.230', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/5310 (KHTML, like Gecko) Chrome/38.0.867.0 Mobile Safari/5310', '2025-09-03 06:34:36', '2025-09-11 19:44:37'),
	(19, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 13, 'http://zelio.test', 'Ms. Susan Marks', 'bradtke.violette@schuppe.biz', 'https://friendsofbotble.com', 'I\'m going to reflect on the ideas presented in this article.', 'approved', '50.47.97.154', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X) AppleWebKit/534.0 (KHTML, like Gecko) Version/15.0 EdgiOS/89.01036.34 Mobile/15E148 Safari/534.0', '2025-08-26 00:11:07', '2025-09-11 19:44:37'),
	(20, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 15, 'http://zelio.test', 'Silas Gutkowski', 'christopher67@flatley.com', 'https://friendsofbotble.com', 'The author\'s passion for the subject shines through in this article.', 'approved', '175.235.70.76', 'Mozilla/5.0 (compatible; MSIE 6.0; Windows 95; Trident/4.1)', '2025-08-16 13:43:16', '2025-09-11 19:44:37'),
	(21, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 12, 'http://zelio.test', 'Cecelia Metz', 'julien19@yahoo.com', 'https://friendsofbotble.com', 'This article challenged my preconceptions in a thought-provoking way.', 'approved', '95.125.134.195', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/5351 (KHTML, like Gecko) Chrome/38.0.855.0 Mobile Safari/5351', '2025-09-05 08:26:49', '2025-09-11 19:44:37'),
	(22, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 6, 'http://zelio.test', 'Jillian Hill', 'cferry@glover.com', 'https://friendsofbotble.com', 'I\'ve added this article to my reading list, it\'s worth revisiting.', 'approved', '176.95.240.197', 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_1_1 like Mac OS X; sl-SI) AppleWebKit/535.21.4 (KHTML, like Gecko) Version/3.0.5 Mobile/8B112 Safari/6535.21.4', '2025-08-24 14:00:38', '2025-09-11 19:44:37'),
	(23, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 12, 'http://zelio.test', 'Gardner Schoen', 'qcole@hotmail.com', 'https://friendsofbotble.com', 'This article offers practical advice that I can apply in real life.', 'approved', '86.205.44.252', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3 rv:6.0; sl-SI) AppleWebKit/531.13.1 (KHTML, like Gecko) Version/5.0.2 Safari/531.13.1', '2025-08-15 23:35:17', '2025-09-11 19:44:37'),
	(24, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 15, 'http://zelio.test', 'Yessenia Schmidt', 'wiley68@dietrich.com', 'https://friendsofbotble.com', 'I\'m going to recommend this article to my study group.', 'approved', '83.95.190.103', 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.2; Trident/3.1)', '2025-08-30 17:34:08', '2025-09-11 19:44:37'),
	(25, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 2, 'http://zelio.test', 'Dr. Una Dibbert', 'qoconner@bartell.com', 'https://friendsofbotble.com', 'The examples provided really helped me understand the concept better.', 'approved', '206.175.97.120', 'Mozilla/5.0 (X11; Linux i686; rv:6.0) Gecko/20120222 Firefox/35.0', '2025-08-20 10:00:35', '2025-09-11 19:44:37'),
	(26, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 6, 'http://zelio.test', 'Kendra Crona PhD', 'litzy.reinger@sporer.org', 'https://friendsofbotble.com', 'I resonate with the ideas presented here.', 'approved', '224.156.19.60', 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/5311 (KHTML, like Gecko) Chrome/39.0.861.0 Mobile Safari/5311', '2025-08-26 17:55:41', '2025-09-11 19:44:37'),
	(27, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 13, 'http://zelio.test', 'Leta Hilpert', 'arianna36@friesen.info', 'https://friendsofbotble.com', 'This article made me think critically about the topic.', 'approved', '48.156.200.156', 'Mozilla/5.0 (Windows CE; nl-NL; rv:1.9.1.20) Gecko/20120419 Firefox/35.0', '2025-09-10 02:23:06', '2025-09-11 19:44:37'),
	(28, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 8, 'http://zelio.test', 'Ubaldo Turner', 'welch.viviane@mcdermott.org', 'https://friendsofbotble.com', 'I\'ll definitely come back to this article for reference.', 'approved', '45.225.3.144', 'Mozilla/5.0 (compatible; MSIE 6.0; Windows NT 5.1; Trident/3.1)', '2025-09-01 14:49:10', '2025-09-11 19:44:37'),
	(29, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 15, 'http://zelio.test', 'Ayana Prosacco', 'timmothy.kreiger@douglas.net', 'https://friendsofbotble.com', 'I\'ve shared this on social media, it\'s too good not to share.', 'approved', '25.38.138.210', 'Mozilla/5.0 (iPad; CPU OS 7_0_1 like Mac OS X; sl-SI) AppleWebKit/531.37.2 (KHTML, like Gecko) Version/4.0.5 Mobile/8B113 Safari/6531.37.2', '2025-08-28 17:14:24', '2025-09-11 19:44:37'),
	(30, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 6, 'http://zelio.test', 'Dr. Shayne Marquardt', 'arnoldo.yundt@yahoo.com', 'https://friendsofbotble.com', 'This article presents a balanced view on a controversial topic.', 'approved', '39.182.194.248', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_6 rv:4.0; nl-NL) AppleWebKit/534.36.3 (KHTML, like Gecko) Version/5.0.1 Safari/534.36.3', '2025-09-02 23:14:13', '2025-09-11 19:44:37'),
	(31, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 5, 'http://zelio.test', 'Arnaldo Dietrich', 'odie66@klein.biz', 'https://friendsofbotble.com', 'I\'m glad I stumbled upon this article, it\'s a gem.', 'approved', '203.166.130.14', 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.0 (KHTML, like Gecko) Chrome/89.0.4745.58 Safari/537.0 EdgA/89.01068.12', '2025-08-14 18:38:17', '2025-09-11 19:44:37'),
	(32, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 4, 'http://zelio.test', 'Mr. Aaron Brakus DVM', 'tito91@moen.org', 'https://friendsofbotble.com', 'I\'ve been struggling with this, your article helped a lot.', 'approved', '43.69.156.100', 'Opera/9.31 (X11; Linux x86_64; sl-SI) Presto/2.12.235 Version/10.00', '2025-08-26 02:22:52', '2025-09-11 19:44:37'),
	(33, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 10, 'http://zelio.test', 'Josefa Adams', 'schmidt.luz@casper.com', 'https://friendsofbotble.com', 'I\'ve learned something new today, thanks to this article.', 'approved', '229.233.205.77', 'Mozilla/5.0 (iPad; CPU OS 7_0_2 like Mac OS X; sl-SI) AppleWebKit/533.8.6 (KHTML, like Gecko) Version/3.0.5 Mobile/8B114 Safari/6533.8.6', '2025-08-13 01:20:51', '2025-09-11 19:44:37'),
	(34, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 9, 'http://zelio.test', 'Francesca Emard', 'dare.alf@conroy.org', 'https://friendsofbotble.com', 'Kudos to the author for a well-researched piece.', 'approved', '79.147.237.244', 'Opera/9.73 (X11; Linux x86_64; en-US) Presto/2.9.345 Version/10.00', '2025-08-16 00:17:59', '2025-09-11 19:44:37'),
	(35, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 9, 'http://zelio.test', 'Mrs. Jayne Crist', 'marilie58@hotmail.com', 'https://friendsofbotble.com', 'I\'m impressed by the depth of knowledge demonstrated here.', 'approved', '212.247.72.117', 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_0) AppleWebKit/5330 (KHTML, like Gecko) Chrome/36.0.845.0 Mobile Safari/5330', '2025-08-29 13:51:18', '2025-09-11 19:44:37'),
	(36, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 12, 'http://zelio.test', 'Trey Howe', 'mreichel@conroy.biz', 'https://friendsofbotble.com', 'This article challenged my assumptions in a good way.', 'approved', '171.32.186.80', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/532.0 (KHTML, like Gecko) Version/15.0 EdgiOS/83.01141.76 Mobile/15E148 Safari/532.0', '2025-08-16 04:18:34', '2025-09-11 19:44:37'),
	(37, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 15, 'http://zelio.test', 'Lonie Gaylord', 'ygottlieb@west.com', 'https://friendsofbotble.com', 'I\'ve shared this with my colleagues, it\'s worth discussing.', 'approved', '161.218.148.171', 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/5330 (KHTML, like Gecko) Chrome/40.0.869.0 Mobile Safari/5330', '2025-08-30 08:17:04', '2025-09-11 19:44:37'),
	(38, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 3, 'http://zelio.test', 'Lindsey Kutch', 'kassulke.retha@gmail.com', 'https://friendsofbotble.com', 'The information presented here is very valuable.', 'approved', '18.43.41.180', 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8 rv:3.0; nl-NL) AppleWebKit/534.31.5 (KHTML, like Gecko) Version/5.0.3 Safari/534.31.5', '2025-09-03 22:53:52', '2025-09-11 19:44:37'),
	(39, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 6, 'http://zelio.test', 'Dr. Fredrick Gusikowski III', 'rylan38@gmail.com', 'https://friendsofbotble.com', 'You have a talent for explaining complex topics clearly.', 'approved', '21.5.75.215', 'Mozilla/5.0 (compatible; MSIE 8.0; Windows 98; Win 9x 4.90; Trident/4.0)', '2025-09-01 15:01:19', '2025-09-11 19:44:37'),
	(40, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 3, 'http://zelio.test', 'Celestine Little I', 'carroll.elijah@yahoo.com', 'https://friendsofbotble.com', 'I\'m inspired to learn more about this after reading your article.', 'approved', '194.171.136.22', 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/5.0)', '2025-09-01 06:17:51', '2025-09-11 19:44:37'),
	(41, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 3, 'http://zelio.test', 'Helga Murray I', 'arianna.hayes@ortiz.biz', 'https://friendsofbotble.com', 'This article deserves wider recognition.', 'approved', '247.53.137.56', 'Opera/9.90 (Windows NT 6.1; sl-SI) Presto/2.8.312 Version/10.00', '2025-09-11 03:11:48', '2025-09-11 19:44:37'),
	(42, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 10, 'http://zelio.test', 'Haskell Adams', 'golden.swift@yahoo.com', 'https://friendsofbotble.com', 'I\'m grateful for the insights shared in this piece.', 'approved', '253.210.229.237', 'Opera/8.11 (X11; Linux x86_64; en-US) Presto/2.11.353 Version/10.00', '2025-08-23 05:38:16', '2025-09-11 19:44:37'),
	(43, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 4, 'http://zelio.test', 'Heath Metz', 'jacinthe.kulas@yahoo.com', 'https://friendsofbotble.com', 'The author presents a balanced view on a controversial topic.', 'approved', '76.253.105.217', 'Mozilla/5.0 (iPad; CPU OS 7_2_2 like Mac OS X; en-US) AppleWebKit/534.32.1 (KHTML, like Gecko) Version/3.0.5 Mobile/8B119 Safari/6534.32.1', '2025-08-16 22:12:45', '2025-09-11 19:44:38'),
	(44, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 14, 'http://zelio.test', 'Sharon Jast', 'stanford.collier@hotmail.com', 'https://friendsofbotble.com', 'I\'m glad I stumbled upon this article, it\'s', 'approved', '114.164.28.244', 'Mozilla/5.0 (Macintosh; PPC Mac OS X 10_5_1) AppleWebKit/5341 (KHTML, like Gecko) Chrome/36.0.889.0 Mobile Safari/5341', '2025-09-05 09:52:12', '2025-09-11 19:44:38'),
	(45, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 8, 'http://zelio.test', 'Kiarra Feil', 'pacocha.althea@adams.org', 'https://friendsofbotble.com', 'I\'ve been searching for information on this topic, glad I found this article. It\'s incredibly insightful and provides a comprehensive overview of the subject matter. I appreciate the effort put into researching and writing this piece. It\'s truly eye-opening and has given me a new perspective. Thank you for sharing your knowledge with us!', 'approved', '150.31.253.160', 'Mozilla/5.0 (compatible; MSIE 6.0; Windows NT 6.0; Trident/5.0)', '2025-08-24 15:08:40', '2025-09-11 19:44:38'),
	(46, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 9, 'http://zelio.test', 'Dr. Milan Wiegand Sr.', 'hilton28@gmail.com', 'https://friendsofbotble.com', 'This article is a masterpiece! It dives deep into the topic and offers valuable insights that are both thought-provoking and enlightening. The author\'s expertise is evident throughout, making it a compelling read from start to finish. I\'ll definitely be coming back to this for reference in the future.', 'approved', '223.59.236.194', 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 5.01; Trident/3.1)', '2025-09-06 13:32:35', '2025-09-11 19:44:38'),
	(47, NULL, NULL, NULL, 'Botble\\Blog\\Models\\Post', 12, 'http://zelio.test', 'Tyree Ullrich', 'smitham.kailey@gerlach.biz', 'https://friendsofbotble.com', 'I\'m amazed by the depth of analysis in this article. It covers a wide range of aspects related to the topic, providing a comprehensive understanding. The clarity of explanation is commendable, making complex concepts easy to grasp. This article has enriched my understanding and sparked further curiosity. Kudos to the author!', 'approved', '171.37.1.187', 'Opera/8.52 (Windows NT 5.2; en-US) Presto/2.11.310 Version/11.00', '2025-08-30 00:18:19', '2025-09-11 19:44:38');

-- membuang struktur untuk table ucuy.galleries
CREATE TABLE IF NOT EXISTS `galleries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_featured` tinyint unsigned NOT NULL DEFAULT '0',
  `order` tinyint unsigned NOT NULL DEFAULT '0',
  `image` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `status` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `galleries_user_id_index` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.galleries: ~8 rows (lebih kurang)
INSERT INTO `galleries` (`id`, `name`, `description`, `is_featured`, `order`, `image`, `user_id`, `status`, `created_at`, `updated_at`) VALUES
	(1, 'Perfect', 'Laboriosam vel omnis aut fuga ab. Ad ut quas qui unde sit qui.', 0, 0, 'main/galleries/1.jpg', 1, 'published', '2025-09-11 19:44:40', '2025-09-11 19:44:40'),
	(2, 'New Day', 'In deserunt delectus porro. Enim quia omnis aut dignissimos animi quia natus. Inventore quas totam fugit ut aut eos.', 0, 0, 'main/galleries/2.jpg', 1, 'published', '2025-09-11 19:44:40', '2025-09-11 19:44:40'),
	(3, 'Happy Day', 'Nihil velit earum ut quasi tenetur consectetur. Rem numquam sit sed asperiores et beatae. Deleniti at autem dolorem minus qui error.', 0, 0, 'main/galleries/3.jpg', 1, 'published', '2025-09-11 19:44:40', '2025-09-11 19:44:40'),
	(4, 'Nature', 'Laborum animi officia sint eos nostrum. Libero libero aut eum dolorum omnis ipsam pariatur. Architecto sint ea dolores quaerat.', 0, 0, 'main/galleries/4.jpg', 1, 'published', '2025-09-11 19:44:40', '2025-09-11 19:44:40'),
	(5, 'Morning', 'Iure voluptatem nisi consectetur. Quia nam dicta excepturi ut. Voluptas quia quisquam odit ut tempore qui blanditiis.', 0, 0, 'main/galleries/5.jpg', 1, 'published', '2025-09-11 19:44:41', '2025-09-11 19:44:41'),
	(6, 'Sunset', 'Praesentium eos eos sequi maiores. Et natus itaque totam. Sunt cumque beatae laboriosam voluptas.', 0, 0, 'main/galleries/6.jpg', 1, 'published', '2025-09-11 19:44:41', '2025-09-11 19:44:41'),
	(7, 'Ocean Views', 'Fuga neque libero et sunt. Natus labore magnam minima suscipit sit nisi atque.', 0, 0, 'main/galleries/7.jpg', 1, 'published', '2025-09-11 19:44:41', '2025-09-11 19:44:41'),
	(8, 'Adventure Time', 'Ratione magnam accusantium corrupti similique porro. Est non reiciendis dolorem. Expedita beatae illum hic sit porro cum quia.', 0, 0, 'main/galleries/8.jpg', 1, 'published', '2025-09-11 19:44:41', '2025-09-11 19:44:41');

-- membuang struktur untuk table ucuy.galleries_translations
CREATE TABLE IF NOT EXISTS `galleries_translations` (
  `lang_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `galleries_id` bigint unsigned NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`lang_code`,`galleries_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.galleries_translations: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.gallery_meta
CREATE TABLE IF NOT EXISTS `gallery_meta` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `images` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `reference_id` bigint unsigned NOT NULL,
  `reference_type` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `gallery_meta_reference_id_index` (`reference_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.gallery_meta: ~8 rows (lebih kurang)
INSERT INTO `gallery_meta` (`id`, `images`, `reference_id`, `reference_type`, `created_at`, `updated_at`) VALUES
	(1, '[{"img":"main\\/galleries\\/1.jpg","description":""},{"img":"main\\/galleries\\/2.jpg","description":""},{"img":"main\\/galleries\\/3.jpg","description":""},{"img":"main\\/galleries\\/4.jpg","description":""},{"img":"main\\/galleries\\/5.jpg","description":""},{"img":"main\\/galleries\\/6.jpg","description":""},{"img":"main\\/galleries\\/7.jpg","description":""},{"img":"main\\/galleries\\/8.jpg","description":""}]', 1, 'Botble\\Gallery\\Models\\Gallery', '2025-09-11 19:44:40', '2025-09-11 19:44:40'),
	(2, '[{"img":"main\\/galleries\\/1.jpg","description":""},{"img":"main\\/galleries\\/2.jpg","description":""},{"img":"main\\/galleries\\/3.jpg","description":""},{"img":"main\\/galleries\\/4.jpg","description":""},{"img":"main\\/galleries\\/5.jpg","description":""},{"img":"main\\/galleries\\/6.jpg","description":""},{"img":"main\\/galleries\\/7.jpg","description":""},{"img":"main\\/galleries\\/8.jpg","description":""}]', 2, 'Botble\\Gallery\\Models\\Gallery', '2025-09-11 19:44:40', '2025-09-11 19:44:40'),
	(3, '[{"img":"main\\/galleries\\/1.jpg","description":""},{"img":"main\\/galleries\\/2.jpg","description":""},{"img":"main\\/galleries\\/3.jpg","description":""},{"img":"main\\/galleries\\/4.jpg","description":""},{"img":"main\\/galleries\\/5.jpg","description":""},{"img":"main\\/galleries\\/6.jpg","description":""},{"img":"main\\/galleries\\/7.jpg","description":""},{"img":"main\\/galleries\\/8.jpg","description":""}]', 3, 'Botble\\Gallery\\Models\\Gallery', '2025-09-11 19:44:40', '2025-09-11 19:44:40'),
	(4, '[{"img":"main\\/galleries\\/1.jpg","description":""},{"img":"main\\/galleries\\/2.jpg","description":""},{"img":"main\\/galleries\\/3.jpg","description":""},{"img":"main\\/galleries\\/4.jpg","description":""},{"img":"main\\/galleries\\/5.jpg","description":""},{"img":"main\\/galleries\\/6.jpg","description":""},{"img":"main\\/galleries\\/7.jpg","description":""},{"img":"main\\/galleries\\/8.jpg","description":""}]', 4, 'Botble\\Gallery\\Models\\Gallery', '2025-09-11 19:44:41', '2025-09-11 19:44:41'),
	(5, '[{"img":"main\\/galleries\\/1.jpg","description":""},{"img":"main\\/galleries\\/2.jpg","description":""},{"img":"main\\/galleries\\/3.jpg","description":""},{"img":"main\\/galleries\\/4.jpg","description":""},{"img":"main\\/galleries\\/5.jpg","description":""},{"img":"main\\/galleries\\/6.jpg","description":""},{"img":"main\\/galleries\\/7.jpg","description":""},{"img":"main\\/galleries\\/8.jpg","description":""}]', 5, 'Botble\\Gallery\\Models\\Gallery', '2025-09-11 19:44:41', '2025-09-11 19:44:41'),
	(6, '[{"img":"main\\/galleries\\/1.jpg","description":""},{"img":"main\\/galleries\\/2.jpg","description":""},{"img":"main\\/galleries\\/3.jpg","description":""},{"img":"main\\/galleries\\/4.jpg","description":""},{"img":"main\\/galleries\\/5.jpg","description":""},{"img":"main\\/galleries\\/6.jpg","description":""},{"img":"main\\/galleries\\/7.jpg","description":""},{"img":"main\\/galleries\\/8.jpg","description":""}]', 6, 'Botble\\Gallery\\Models\\Gallery', '2025-09-11 19:44:41', '2025-09-11 19:44:41'),
	(7, '[{"img":"main\\/galleries\\/1.jpg","description":""},{"img":"main\\/galleries\\/2.jpg","description":""},{"img":"main\\/galleries\\/3.jpg","description":""},{"img":"main\\/galleries\\/4.jpg","description":""},{"img":"main\\/galleries\\/5.jpg","description":""},{"img":"main\\/galleries\\/6.jpg","description":""},{"img":"main\\/galleries\\/7.jpg","description":""},{"img":"main\\/galleries\\/8.jpg","description":""}]', 7, 'Botble\\Gallery\\Models\\Gallery', '2025-09-11 19:44:41', '2025-09-11 19:44:41'),
	(8, '[{"img":"main\\/galleries\\/1.jpg","description":""},{"img":"main\\/galleries\\/2.jpg","description":""},{"img":"main\\/galleries\\/3.jpg","description":""},{"img":"main\\/galleries\\/4.jpg","description":""},{"img":"main\\/galleries\\/5.jpg","description":""},{"img":"main\\/galleries\\/6.jpg","description":""},{"img":"main\\/galleries\\/7.jpg","description":""},{"img":"main\\/galleries\\/8.jpg","description":""}]', 8, 'Botble\\Gallery\\Models\\Gallery', '2025-09-11 19:44:41', '2025-09-11 19:44:41'),
	(16, NULL, 1, 'Botble\\Page\\Models\\Page', '2025-12-31 07:30:26', '2025-12-31 07:30:26');

-- membuang struktur untuk table ucuy.gallery_meta_translations
CREATE TABLE IF NOT EXISTS `gallery_meta_translations` (
  `lang_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `gallery_meta_id` bigint unsigned NOT NULL,
  `images` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`lang_code`,`gallery_meta_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.gallery_meta_translations: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.jobs
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.jobs: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.language_meta
CREATE TABLE IF NOT EXISTS `language_meta` (
  `lang_meta_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `lang_meta_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lang_meta_origin` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_id` bigint unsigned NOT NULL,
  `reference_type` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`lang_meta_id`),
  KEY `language_meta_reference_id_index` (`reference_id`),
  KEY `meta_code_index` (`lang_meta_code`),
  KEY `meta_origin_index` (`lang_meta_origin`),
  KEY `meta_reference_type_index` (`reference_type`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.language_meta: ~8 rows (lebih kurang)
INSERT INTO `language_meta` (`lang_meta_id`, `lang_meta_code`, `lang_meta_origin`, `reference_id`, `reference_type`) VALUES
	(1, 'en_US', 'e878de5b0d8eb1b472c2e701cf8175f9', 1, 'Botble\\Menu\\Models\\MenuLocation'),
	(2, 'en_US', '7fddc237557dd47968d8580238ae4cf1', 1, 'Botble\\Menu\\Models\\Menu'),
	(3, 'en_US', '64390eaeaa5480d747bebf1ab64fb969', 1, 'Botble\\Menu\\Models\\MenuNode'),
	(4, 'en_US', 'abc5f9caa79cb53b82cac6fb051da627', 5, 'Botble\\Menu\\Models\\MenuNode'),
	(5, 'en_US', '1ffe842bf210cf4628c3ebdc602168d0', 6, 'Botble\\Menu\\Models\\MenuNode'),
	(6, 'en_US', '62f8f3bfe228f73037a9d8ecba99cb1e', 7, 'Botble\\Menu\\Models\\MenuNode'),
	(7, 'en_US', 'd089e38a8b6aa07532f340ff970d4182', 8, 'Botble\\Menu\\Models\\MenuNode'),
	(8, 'en_US', '6eb110fa2988b849a312123ff5a6c79b', 9, 'Botble\\Menu\\Models\\MenuNode');

-- membuang struktur untuk table ucuy.languages
CREATE TABLE IF NOT EXISTS `languages` (
  `lang_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `lang_name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lang_locale` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lang_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lang_flag` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lang_is_default` tinyint unsigned NOT NULL DEFAULT '0',
  `lang_order` int NOT NULL DEFAULT '0',
  `lang_is_rtl` tinyint unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`lang_id`),
  KEY `lang_locale_index` (`lang_locale`),
  KEY `lang_code_index` (`lang_code`),
  KEY `lang_is_default_index` (`lang_is_default`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.languages: ~0 rows (lebih kurang)
INSERT INTO `languages` (`lang_id`, `lang_name`, `lang_locale`, `lang_code`, `lang_flag`, `lang_is_default`, `lang_order`, `lang_is_rtl`) VALUES
	(1, 'English', 'en', 'en_US', 'us', 1, 0, 0);

-- membuang struktur untuk table ucuy.media_files
CREATE TABLE IF NOT EXISTS `media_files` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `folder_id` bigint unsigned NOT NULL DEFAULT '0',
  `mime_type` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` int NOT NULL,
  `url` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `visibility` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'public',
  PRIMARY KEY (`id`),
  KEY `media_files_user_id_index` (`user_id`),
  KEY `media_files_index` (`folder_id`,`user_id`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=90 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.media_files: ~89 rows (lebih kurang)
INSERT INTO `media_files` (`id`, `user_id`, `name`, `alt`, `folder_id`, `mime_type`, `size`, `url`, `options`, `created_at`, `updated_at`, `deleted_at`, `visibility`) VALUES
	(1, 0, '1', '1', 2, 'image/png', 9448, 'main/posts/1.png', '[]', '2025-09-11 19:44:24', '2025-09-11 19:44:24', NULL, 'public'),
	(2, 0, '10', '10', 2, 'image/png', 9448, 'main/posts/10.png', '[]', '2025-09-11 19:44:24', '2025-09-11 19:44:24', NULL, 'public'),
	(3, 0, '11', '11', 2, 'image/png', 9448, 'main/posts/11.png', '[]', '2025-09-11 19:44:25', '2025-09-11 19:44:25', NULL, 'public'),
	(4, 0, '12', '12', 2, 'image/png', 9448, 'main/posts/12.png', '[]', '2025-09-11 19:44:25', '2025-09-11 19:44:25', NULL, 'public'),
	(5, 0, '2', '2', 2, 'image/png', 9448, 'main/posts/2.png', '[]', '2025-09-11 19:44:26', '2025-09-11 19:44:26', NULL, 'public'),
	(6, 0, '3', '3', 2, 'image/png', 9448, 'main/posts/3.png', '[]', '2025-09-11 19:44:26', '2025-09-11 19:44:26', NULL, 'public'),
	(7, 0, '4', '4', 2, 'image/png', 9448, 'main/posts/4.png', '[]', '2025-09-11 19:44:27', '2025-09-11 19:44:27', NULL, 'public'),
	(8, 0, '5', '5', 2, 'image/png', 9448, 'main/posts/5.png', '[]', '2025-09-11 19:44:27', '2025-09-11 19:44:27', NULL, 'public'),
	(9, 0, '6', '6', 2, 'image/png', 9448, 'main/posts/6.png', '[]', '2025-09-11 19:44:27', '2025-09-11 19:44:27', NULL, 'public'),
	(10, 0, '7', '7', 2, 'image/png', 9448, 'main/posts/7.png', '[]', '2025-09-11 19:44:27', '2025-09-11 19:44:27', NULL, 'public'),
	(11, 0, '8', '8', 2, 'image/png', 9448, 'main/posts/8.png', '[]', '2025-09-11 19:44:27', '2025-09-11 19:44:27', NULL, 'public'),
	(12, 0, '9', '9', 2, 'image/png', 9448, 'main/posts/9.png', '[]', '2025-09-11 19:44:28', '2025-09-11 19:44:28', NULL, 'public'),
	(13, 0, 'background', 'background', 2, 'image/png', 9448, 'main/posts/background.png', '[]', '2025-09-11 19:44:28', '2025-09-11 19:44:28', NULL, 'public'),
	(14, 0, '1', '1', 3, 'image/png', 2100, 'main/avatars/1.png', '[]', '2025-09-11 19:44:28', '2025-09-11 19:44:28', NULL, 'public'),
	(15, 0, '2', '2', 3, 'image/png', 2100, 'main/avatars/2.png', '[]', '2025-09-11 19:44:29', '2025-09-11 19:44:29', NULL, 'public'),
	(16, 0, 'man', 'man', 3, 'image/png', 2100, 'main/avatars/man.png', '[]', '2025-09-11 19:44:29', '2025-09-11 19:44:29', NULL, 'public'),
	(17, 0, '1', '1', 4, 'image/png', 9448, 'main/projects/1.png', '[]', '2025-09-11 19:44:29', '2025-09-11 19:44:29', NULL, 'public'),
	(18, 0, '2', '2', 4, 'image/png', 9448, 'main/projects/2.png', '[]', '2025-09-11 19:44:29', '2025-09-11 19:44:29', NULL, 'public'),
	(19, 0, '3', '3', 4, 'image/png', 9448, 'main/projects/3.png', '[]', '2025-09-11 19:44:29', '2025-09-11 19:44:29', NULL, 'public'),
	(20, 0, '4', '4', 4, 'image/png', 9448, 'main/projects/4.png', '[]', '2025-09-11 19:44:30', '2025-09-11 19:44:30', NULL, 'public'),
	(21, 0, 'corporation-avatar', 'corporation-avatar', 6, 'image/png', 674, 'code/general/corporation-avatar.png', '[]', '2025-09-11 19:44:30', '2025-09-11 19:44:30', NULL, 'public'),
	(22, 0, 'favicon', 'favicon', 6, 'image/png', 2465, 'code/general/favicon.png', '[]', '2025-09-11 19:44:30', '2025-09-11 19:44:30', NULL, 'public'),
	(23, 0, 'footer-bg', 'footer-bg', 6, 'image/png', 6888, 'code/general/footer-bg.png', '[]', '2025-09-11 19:44:30', '2025-09-11 19:44:30', NULL, 'public'),
	(24, 0, 'hero-bg-dark', 'hero-bg-dark', 6, 'image/png', 113996, 'code/general/hero-bg-dark.png', '[]', '2025-09-11 19:44:31', '2025-09-11 19:44:31', NULL, 'public'),
	(25, 0, 'hero-bg', 'hero-bg', 6, 'image/png', 116152, 'code/general/hero-bg.png', '[]', '2025-09-11 19:44:31', '2025-09-11 19:44:31', NULL, 'public'),
	(26, 0, 'logo-dark', 'logo-dark', 6, 'image/png', 2465, 'code/general/logo-dark.png', '[]', '2025-09-11 19:44:31', '2025-09-11 19:44:31', NULL, 'public'),
	(27, 0, 'people-shape', 'people-shape', 6, 'image/png', 7048, 'code/general/people-shape.png', '[]', '2025-09-11 19:44:31', '2025-09-11 19:44:31', NULL, 'public'),
	(28, 0, 'people', 'people', 6, 'image/png', 10553, 'code/general/people.png', '[]', '2025-09-11 19:44:32', '2025-09-11 19:44:32', NULL, 'public'),
	(29, 0, 'projects-bg', 'projects-bg', 6, 'image/png', 80873, 'code/general/projects-bg.png', '[]', '2025-09-11 19:44:32', '2025-09-11 19:44:32', NULL, 'public'),
	(30, 0, 'services-bg', 'services-bg', 6, 'image/png', 18424, 'code/general/services-bg.png', '[]', '2025-09-11 19:44:32', '2025-09-11 19:44:32', NULL, 'public'),
	(31, 0, 'static-bg', 'static-bg', 6, 'image/png', 26400, 'code/general/static-bg.png', '[]', '2025-09-11 19:44:32', '2025-09-11 19:44:32', NULL, 'public'),
	(32, 0, '1', '1', 7, 'image/png', 1866, 'code/skills/1.png', '[]', '2025-09-11 19:44:33', '2025-09-11 19:44:33', NULL, 'public'),
	(33, 0, '2', '2', 7, 'image/png', 1866, 'code/skills/2.png', '[]', '2025-09-11 19:44:33', '2025-09-11 19:44:33', NULL, 'public'),
	(34, 0, '3', '3', 7, 'image/png', 1866, 'code/skills/3.png', '[]', '2025-09-11 19:44:33', '2025-09-11 19:44:33', NULL, 'public'),
	(35, 0, '4', '4', 7, 'image/png', 1866, 'code/skills/4.png', '[]', '2025-09-11 19:44:33', '2025-09-11 19:44:33', NULL, 'public'),
	(36, 0, '5', '5', 7, 'image/png', 1866, 'code/skills/5.png', '[]', '2025-09-11 19:44:33', '2025-09-11 19:44:33', NULL, 'public'),
	(37, 0, '6', '6', 7, 'image/png', 1866, 'code/skills/6.png', '[]', '2025-09-11 19:44:34', '2025-09-11 19:44:34', NULL, 'public'),
	(38, 0, '7', '7', 7, 'image/png', 1866, 'code/skills/7.png', '[]', '2025-09-11 19:44:34', '2025-09-11 19:44:34', NULL, 'public'),
	(39, 0, '8', '8', 7, 'image/png', 1866, 'code/skills/8.png', '[]', '2025-09-11 19:44:34', '2025-09-11 19:44:34', NULL, 'public'),
	(40, 0, '9', '9', 7, 'image/png', 1866, 'code/skills/9.png', '[]', '2025-09-11 19:44:34', '2025-09-11 19:44:34', NULL, 'public'),
	(41, 0, 'bravado', 'bravado', 8, 'image/png', 1726, 'code/companies/bravado.png', '[]', '2025-09-11 19:44:34', '2025-09-11 19:44:34', NULL, 'public'),
	(42, 0, 'gocardless', 'gocardless', 8, 'image/png', 1726, 'code/companies/gocardless.png', '[]', '2025-09-11 19:44:34', '2025-09-11 19:44:34', NULL, 'public'),
	(43, 0, 'google', 'google', 8, 'image/png', 1726, 'code/companies/google.png', '[]', '2025-09-11 19:44:35', '2025-09-11 19:44:35', NULL, 'public'),
	(44, 0, 'intercom', 'intercom', 8, 'image/png', 1726, 'code/companies/intercom.png', '[]', '2025-09-11 19:44:35', '2025-09-11 19:44:35', NULL, 'public'),
	(45, 0, 'monzo', 'monzo', 8, 'image/png', 1726, 'code/companies/monzo.png', '[]', '2025-09-11 19:44:35', '2025-09-11 19:44:35', NULL, 'public'),
	(46, 0, 'samsung', 'samsung', 8, 'image/png', 1726, 'code/companies/samsung.png', '[]', '2025-09-11 19:44:35', '2025-09-11 19:44:35', NULL, 'public'),
	(47, 0, 'spotify', 'spotify', 8, 'image/png', 1726, 'code/companies/spotify.png', '[]', '2025-09-11 19:44:35', '2025-09-11 19:44:35', NULL, 'public'),
	(48, 0, 'stripe', 'stripe', 8, 'image/png', 1726, 'code/companies/stripe.png', '[]', '2025-09-11 19:44:35', '2025-09-11 19:44:35', NULL, 'public'),
	(49, 0, 'visa', 'visa', 8, 'image/png', 1726, 'code/companies/visa.png', '[]', '2025-09-11 19:44:36', '2025-09-11 19:44:36', NULL, 'public'),
	(50, 0, 'amazon', 'amazon', 9, 'image/png', 2100, 'code/experiences/amazon.png', '[]', '2025-09-11 19:44:36', '2025-09-11 19:44:36', NULL, 'public'),
	(51, 0, 'google', 'google', 9, 'image/png', 2100, 'code/experiences/google.png', '[]', '2025-09-11 19:44:36', '2025-09-11 19:44:36', NULL, 'public'),
	(52, 0, 'paypal', 'paypal', 9, 'image/png', 2100, 'code/experiences/paypal.png', '[]', '2025-09-11 19:44:36', '2025-09-11 19:44:36', NULL, 'public'),
	(53, 0, 'x', 'x', 9, 'image/png', 2100, 'code/experiences/x.png', '[]', '2025-09-11 19:44:36', '2025-09-11 19:44:36', NULL, 'public'),
	(54, 0, '1', '1', 10, 'image/jpeg', 61527, 'main/galleries/1.jpg', '[]', '2025-09-11 19:44:38', '2025-09-11 19:44:38', NULL, 'public'),
	(55, 0, '2', '2', 10, 'image/jpeg', 70517, 'main/galleries/2.jpg', '[]', '2025-09-11 19:44:38', '2025-09-11 19:44:38', NULL, 'public'),
	(56, 0, '3', '3', 10, 'image/jpeg', 120412, 'main/galleries/3.jpg', '[]', '2025-09-11 19:44:38', '2025-09-11 19:44:38', NULL, 'public'),
	(57, 0, '4', '4', 10, 'image/jpeg', 230496, 'main/galleries/4.jpg', '[]', '2025-09-11 19:44:39', '2025-09-11 19:44:39', NULL, 'public'),
	(58, 0, '5', '5', 10, 'image/jpeg', 194413, 'main/galleries/5.jpg', '[]', '2025-09-11 19:44:39', '2025-09-11 19:44:39', NULL, 'public'),
	(59, 0, '6', '6', 10, 'image/jpeg', 82763, 'main/galleries/6.jpg', '[]', '2025-09-11 19:44:39', '2025-09-11 19:44:39', NULL, 'public'),
	(60, 0, '7', '7', 10, 'image/jpeg', 62110, 'main/galleries/7.jpg', '[]', '2025-09-11 19:44:40', '2025-09-11 19:44:40', NULL, 'public'),
	(61, 0, '8', '8', 10, 'image/jpeg', 156619, 'main/galleries/8.jpg', '[]', '2025-09-11 19:44:40', '2025-09-11 19:44:40', NULL, 'public'),
	(62, 1, 'logo-dark-styled', 'logo-dark-styled', 0, 'image/png', 190765, 'logo-dark-styled.png', '[]', '2025-11-26 08:22:24', '2025-11-26 08:22:24', NULL, 'public'),
	(63, 1, 'Favicon-01', 'Favicon-01', 0, 'image/png', 1714, 'favicon-01.png', '[]', '2025-11-26 08:22:33', '2025-11-26 08:22:33', NULL, 'public'),
	(64, 1, 'photo_2025-09-26_19-07-38', 'photo_2025-09-26_19-07-38', 0, 'image/jpeg', 92292, 'photo-2025-09-26-19-07-38.jpg', '[]', '2025-11-26 08:24:29', '2025-11-26 08:24:29', NULL, 'public'),
	(65, 1, 'photo_2025-09-26_19-07-38 (1)', 'photo_2025-09-26_19-07-38 (1)', 0, 'image/jpeg', 84545, 'photo-2025-09-26-19-07-38-1.jpg', '[]', '2025-11-26 08:34:44', '2025-11-26 08:34:44', NULL, 'public'),
	(66, 1, '4', '4', 0, 'image/png', 5111, '4.png', '[]', '2025-11-28 12:12:20', '2025-11-28 12:12:20', NULL, 'public'),
	(67, 1, '1', '1', 0, 'image/png', 4130, '1.png', '[]', '2025-11-28 12:12:20', '2025-11-28 12:12:20', NULL, 'public'),
	(68, 1, '5', '5', 0, 'image/png', 3244, '5.png', '[]', '2025-11-28 12:12:21', '2025-11-28 12:12:21', NULL, 'public'),
	(69, 1, '2', '2', 0, 'image/png', 4572, '2.png', '[]', '2025-11-28 12:12:22', '2025-11-28 12:12:22', NULL, 'public'),
	(70, 1, '3', '3', 0, 'image/png', 2464, '3.png', '[]', '2025-11-28 12:12:22', '2025-11-28 12:12:22', NULL, 'public'),
	(71, 1, '464370286_1902198303591946_9062885145854930439_n', '464370286_1902198303591946_9062885145854930439_n', 0, 'image/jpeg', 5698, '464370286-1902198303591946-9062885145854930439-n.jpg', '[]', '2025-12-30 10:21:02', '2025-12-30 10:21:02', NULL, 'public'),
	(72, 1, 'nextjs', 'nextjs', 0, 'image/png', 3305, 'nextjs.png', '[]', '2025-12-31 07:04:37', '2025-12-31 07:04:37', NULL, 'public'),
	(73, 1, 'firebase', 'firebase', 0, 'image/jpeg', 2248, 'firebase.jpg', '[]', '2025-12-31 07:05:59', '2025-12-31 07:05:59', NULL, 'public'),
	(74, 1, 'mongodb', 'mongodb', 0, 'image/jpeg', 2857, 'mongodb.jpg', '[]', '2025-12-31 07:07:11', '2025-12-31 07:07:11', NULL, 'public'),
	(75, 1, 'nodejs', 'nodejs', 0, 'image/png', 5944, 'nodejs.png', '[]', '2025-12-31 07:08:31', '2025-12-31 07:08:31', NULL, 'public'),
	(76, 1, 'nextjs-1', 'nextjs-1', 0, 'image/png', 6828, 'nextjs-1.png', '[]', '2025-12-31 07:10:15', '2025-12-31 07:10:15', NULL, 'public'),
	(77, 1, 'firebase-removebg-preview', 'firebase-removebg-preview', 0, 'image/png', 12239, 'firebase-removebg-preview.png', '[]', '2025-12-31 07:11:03', '2025-12-31 07:11:03', NULL, 'public'),
	(78, 1, 'firebase-1', 'firebase-1', 0, 'image/png', 12239, 'firebase-1.png', '[]', '2025-12-31 07:11:29', '2025-12-31 07:11:29', NULL, 'public'),
	(79, 1, 'mongodb-1', 'mongodb-1', 0, 'image/png', 15970, 'mongodb-1.png', '[]', '2025-12-31 07:11:40', '2025-12-31 07:11:40', NULL, 'public'),
	(80, 1, 'tailwind-css-logo-rounded-free-png', 'tailwind-css-logo-rounded-free-png', 0, 'image/webp', 16344, 'tailwind-css-logo-rounded-free-png.webp', '[]', '2025-12-31 07:14:44', '2025-12-31 07:14:44', NULL, 'public'),
	(81, 1, '1183672', '1183672', 0, 'image/png', 9153, '1183672.png', '[]', '2025-12-31 07:15:25', '2025-12-31 07:15:25', NULL, 'public'),
	(82, 1, 'vuejs', 'vuejs', 0, 'image/png', 2459, 'vuejs.png', '[]', '2025-12-31 07:16:52', '2025-12-31 07:16:52', NULL, 'public'),
	(83, 1, 'angular', 'angular', 0, 'image/png', 8242, 'angular.png', '[]', '2025-12-31 07:17:36', '2025-12-31 07:17:36', NULL, 'public'),
	(84, 1, 'laravel', 'laravel', 0, 'image/png', 3276, 'laravel.png', '[]', '2025-12-31 07:18:48', '2025-12-31 07:18:48', NULL, 'public'),
	(85, 1, 'Icon', 'Icon', 0, 'image/png', 144178, 'icon.png', '[]', '2025-12-31 07:21:45', '2025-12-31 07:21:45', NULL, 'public'),
	(86, 1, 'Icon (1)', 'Icon (1)', 0, 'image/png', 143268, 'icon-1.png', '[]', '2025-12-31 07:22:28', '2025-12-31 07:22:28', NULL, 'public'),
	(87, 1, 'haribima', 'haribima', 0, 'image/png', 15329, 'haribima.png', '[]', '2025-12-31 07:24:02', '2025-12-31 07:24:02', NULL, 'public'),
	(88, 1, 'itd', 'itd', 0, 'image/png', 19093, 'itd.png', '[]', '2025-12-31 07:26:33', '2025-12-31 07:26:33', NULL, 'public'),
	(89, 1, 'haribimait', 'haribimait', 0, 'image/png', 9834, 'haribimait.png', '[]', '2025-12-31 07:26:42', '2025-12-31 07:26:42', NULL, 'public');

-- membuang struktur untuk table ucuy.media_folders
CREATE TABLE IF NOT EXISTS `media_folders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slug` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_id` bigint unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `media_folders_user_id_index` (`user_id`),
  KEY `media_folders_index` (`parent_id`,`user_id`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.media_folders: ~10 rows (lebih kurang)
INSERT INTO `media_folders` (`id`, `user_id`, `name`, `color`, `slug`, `parent_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
	(1, 0, 'main', NULL, 'main', 0, '2025-09-11 19:44:24', '2025-09-11 19:44:24', NULL),
	(2, 0, 'posts', NULL, 'posts', 1, '2025-09-11 19:44:24', '2025-09-11 19:44:24', NULL),
	(3, 0, 'avatars', NULL, 'avatars', 1, '2025-09-11 19:44:28', '2025-09-11 19:44:28', NULL),
	(4, 0, 'projects', NULL, 'projects', 1, '2025-09-11 19:44:29', '2025-09-11 19:44:29', NULL),
	(5, 0, 'code', NULL, 'code', 0, '2025-09-11 19:44:30', '2025-09-11 19:44:30', NULL),
	(6, 0, 'general', NULL, 'general', 5, '2025-09-11 19:44:30', '2025-09-11 19:44:30', NULL),
	(7, 0, 'skills', NULL, 'skills', 5, '2025-09-11 19:44:33', '2025-09-11 19:44:33', NULL),
	(8, 0, 'companies', NULL, 'companies', 5, '2025-09-11 19:44:34', '2025-09-11 19:44:34', NULL),
	(9, 0, 'experiences', NULL, 'experiences', 5, '2025-09-11 19:44:36', '2025-09-11 19:44:36', NULL),
	(10, 0, 'galleries', NULL, 'galleries', 1, '2025-09-11 19:44:38', '2025-09-11 19:44:38', NULL);

-- membuang struktur untuk table ucuy.media_settings
CREATE TABLE IF NOT EXISTS `media_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `media_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.media_settings: ~1 rows (lebih kurang)
INSERT INTO `media_settings` (`id`, `key`, `value`, `media_id`, `user_id`, `created_at`, `updated_at`) VALUES
	(1, 'recent_items', '[{"id":89,"is_folder":false},{"id":87,"is_folder":false},{"id":88,"is_folder":false},{"id":86,"is_folder":false},{"id":85,"is_folder":false},{"id":84,"is_folder":false},{"id":83,"is_folder":false},{"id":82,"is_folder":false},{"id":81,"is_folder":false},{"id":80,"is_folder":false},{"id":79,"is_folder":false},{"id":78,"is_folder":false},{"id":77,"is_folder":false},{"id":76,"is_folder":false},{"id":75,"is_folder":false},{"id":74,"is_folder":false},{"id":70,"is_folder":false},{"id":73,"is_folder":false},{"id":72,"is_folder":false},{"id":71,"is_folder":false}]', NULL, 1, '2025-11-26 08:22:25', '2025-12-31 07:26:42');

-- membuang struktur untuk table ucuy.menu_locations
CREATE TABLE IF NOT EXISTS `menu_locations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `menu_id` bigint unsigned NOT NULL,
  `location` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `menu_locations_menu_id_created_at_index` (`menu_id`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.menu_locations: ~0 rows (lebih kurang)
INSERT INTO `menu_locations` (`id`, `menu_id`, `location`, `created_at`, `updated_at`) VALUES
	(1, 1, 'main-menu', '2025-09-11 19:44:37', '2025-09-11 19:44:37');

-- membuang struktur untuk table ucuy.menu_nodes
CREATE TABLE IF NOT EXISTS `menu_nodes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `menu_id` bigint unsigned NOT NULL,
  `parent_id` bigint unsigned NOT NULL DEFAULT '0',
  `reference_id` bigint unsigned DEFAULT NULL,
  `reference_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `url` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon_font` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` tinyint unsigned NOT NULL DEFAULT '0',
  `title` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `css_class` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '_self',
  `has_child` tinyint unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `menu_nodes_menu_id_index` (`menu_id`),
  KEY `menu_nodes_parent_id_index` (`parent_id`),
  KEY `reference_id` (`reference_id`),
  KEY `reference_type` (`reference_type`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.menu_nodes: ~6 rows (lebih kurang)
INSERT INTO `menu_nodes` (`id`, `menu_id`, `parent_id`, `reference_id`, `reference_type`, `url`, `icon_font`, `position`, `title`, `css_class`, `target`, `has_child`, `created_at`, `updated_at`) VALUES
	(1, 1, 0, 1, 'Botble\\Page\\Models\\Page', '', '', 0, 'Home', '', '_self', 0, '2025-09-11 19:44:37', '2025-12-30 03:07:08'),
	(5, 1, 0, 2, 'Botble\\Page\\Models\\Page', '/services', '', 1, 'Services', '', '_self', 0, '2025-09-11 19:44:37', '2025-12-30 03:07:08'),
	(6, 1, 0, 3, 'Botble\\Page\\Models\\Page', '/projects', '', 2, 'Portfolio', '', '_self', 0, '2025-09-11 19:44:37', '2025-12-30 03:07:08'),
	(7, 1, 0, 4, 'Botble\\Page\\Models\\Page', '/pricing', '', 3, 'Pricing', '', '_self', 0, '2025-09-11 19:44:37', '2025-12-30 03:07:08'),
	(8, 1, 0, 5, 'Botble\\Page\\Models\\Page', '/blog', '', 4, 'Blog', '', '_self', 0, '2025-09-11 19:44:37', '2025-12-30 03:07:08'),
	(9, 1, 0, 6, 'Botble\\Page\\Models\\Page', '/contact', '', 5, 'Contact', '', '_self', 0, '2025-09-11 19:44:37', '2025-12-30 03:07:08');

-- membuang struktur untuk table ucuy.menus
CREATE TABLE IF NOT EXISTS `menus` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `menus_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.menus: ~0 rows (lebih kurang)
INSERT INTO `menus` (`id`, `name`, `slug`, `status`, `created_at`, `updated_at`) VALUES
	(1, 'Main Menu', 'main-menu', 'published', '2025-09-11 19:44:37', '2025-12-30 03:07:07');

-- membuang struktur untuk table ucuy.meta_boxes
CREATE TABLE IF NOT EXISTS `meta_boxes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `meta_key` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `meta_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `reference_id` bigint unsigned NOT NULL,
  `reference_type` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `meta_boxes_reference_id_index` (`reference_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.meta_boxes: ~18 rows (lebih kurang)
INSERT INTO `meta_boxes` (`id`, `meta_key`, `meta_value`, `reference_id`, `reference_type`, `created_at`, `updated_at`) VALUES
	(1, 'icon', '["ti ti-api"]', 1, 'Botble\\Portfolio\\Models\\Service', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(2, 'icon', '["ti ti-code"]', 2, 'Botble\\Portfolio\\Models\\Service', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(3, 'icon', '["ti ti-device-mobile"]', 3, 'Botble\\Portfolio\\Models\\Service', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(4, 'icon', '["ti ti-server"]', 4, 'Botble\\Portfolio\\Models\\Service', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(5, 'icon', '["ti ti-cloud"]', 5, 'Botble\\Portfolio\\Models\\Service', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(6, 'icon', '["ti ti-database"]', 6, 'Botble\\Portfolio\\Models\\Service', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(7, 'link', '["https:\\/\\/example.com\\/crm-system"]', 1, 'Botble\\Portfolio\\Models\\Project', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(8, 'github_url', '["https:\\/\\/github.com\\/botble"]', 1, 'Botble\\Portfolio\\Models\\Project', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(9, 'category_ids', '[[1]]', 1, 'Botble\\Portfolio\\Models\\Project', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(10, 'link', '["https:\\/\\/example.com\\/e-learning"]', 2, 'Botble\\Portfolio\\Models\\Project', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(11, 'github_url', '["https:\\/\\/github.com\\/botble"]', 2, 'Botble\\Portfolio\\Models\\Project', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(12, 'category_ids', '[[1,2]]', 2, 'Botble\\Portfolio\\Models\\Project', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(13, 'link', '["https:\\/\\/example.com\\/mobile-banking"]', 3, 'Botble\\Portfolio\\Models\\Project', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(14, 'github_url', '["https:\\/\\/github.com\\/botble"]', 3, 'Botble\\Portfolio\\Models\\Project', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(15, 'category_ids', '[[3]]', 3, 'Botble\\Portfolio\\Models\\Project', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(16, 'link', '["https:\\/\\/example.com\\/cloud-infrastructure"]', 4, 'Botble\\Portfolio\\Models\\Project', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(17, 'github_url', '["https:\\/\\/github.com\\/botble"]', 4, 'Botble\\Portfolio\\Models\\Project', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(18, 'category_ids', '[[4]]', 4, 'Botble\\Portfolio\\Models\\Project', '2025-09-11 19:44:30', '2025-09-11 19:44:30');

-- membuang struktur untuk table ucuy.migrations
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.migrations: ~92 rows (lebih kurang)
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
	(1, '0001_01_01_000001_create_cache_table', 1),
	(2, '2013_04_09_032329_create_base_tables', 1),
	(3, '2013_04_09_062329_create_revisions_table', 1),
	(4, '2014_10_12_000000_create_users_table', 1),
	(5, '2014_10_12_100000_create_password_reset_tokens_table', 1),
	(6, '2015_06_18_033822_create_blog_table', 1),
	(7, '2015_06_29_025744_create_audit_history', 1),
	(8, '2016_05_28_112028_create_system_request_logs_table', 1),
	(9, '2016_06_10_230148_create_acl_tables', 1),
	(10, '2016_06_14_230857_create_menus_table', 1),
	(11, '2016_06_17_091537_create_contacts_table', 1),
	(12, '2016_06_28_221418_create_pages_table', 1),
	(13, '2016_10_03_032336_create_languages_table', 1),
	(14, '2016_10_05_074239_create_setting_table', 1),
	(15, '2016_10_07_193005_create_translations_table', 1),
	(16, '2016_10_13_150201_create_galleries_table', 1),
	(17, '2016_11_28_032840_create_dashboard_widget_tables', 1),
	(18, '2016_12_16_084601_create_widgets_table', 1),
	(19, '2017_05_09_070343_create_media_tables', 1),
	(20, '2017_10_24_154832_create_newsletter_table', 1),
	(21, '2017_11_03_070450_create_slug_table', 1),
	(22, '2018_07_09_214610_create_testimonial_table', 1),
	(23, '2018_07_09_221238_create_faq_table', 1),
	(24, '2019_01_05_053554_create_jobs_table', 1),
	(25, '2019_08_19_000000_create_failed_jobs_table', 1),
	(26, '2019_12_14_000001_create_personal_access_tokens_table', 1),
	(27, '2021_02_16_092633_remove_default_value_for_author_type', 1),
	(28, '2021_10_25_021023_fix-priority-load-for-language-advanced', 1),
	(29, '2021_12_03_030600_create_blog_translations', 1),
	(30, '2021_12_03_075608_create_page_translations', 1),
	(31, '2021_12_03_082134_create_faq_translations', 1),
	(32, '2021_12_03_082953_create_gallery_translations', 1),
	(33, '2021_12_03_083642_create_testimonials_translations', 1),
	(34, '2022_04_19_113923_add_index_to_table_posts', 1),
	(35, '2022_04_20_100851_add_index_to_media_table', 1),
	(36, '2022_04_20_101046_add_index_to_menu_table', 1),
	(37, '2022_04_30_034048_create_gallery_meta_translations_table', 1),
	(38, '2022_07_10_034813_move_lang_folder_to_root', 1),
	(39, '2022_08_04_051940_add_missing_column_expires_at', 1),
	(40, '2022_09_01_000001_create_admin_notifications_tables', 1),
	(41, '2022_10_14_024629_drop_column_is_featured', 1),
	(42, '2022_11_18_063357_add_missing_timestamp_in_table_settings', 1),
	(43, '2022_12_02_093615_update_slug_index_columns', 1),
	(44, '2023_01_30_024431_add_alt_to_media_table', 1),
	(45, '2023_02_16_042611_drop_table_password_resets', 1),
	(46, '2023_04_23_005903_add_column_permissions_to_admin_notifications', 1),
	(47, '2023_05_10_075124_drop_column_id_in_role_users_table', 1),
	(48, '2023_07_06_011444_create_slug_translations_table', 1),
	(49, '2023_07_25_072632_create_portfolio_tables', 1),
	(50, '2023_08_11_060908_create_announcements_table', 1),
	(51, '2023_08_21_090810_make_page_content_nullable', 1),
	(52, '2023_08_29_074620_make_column_author_id_nullable', 1),
	(53, '2023_08_29_075308_make_column_user_id_nullable', 1),
	(54, '2023_09_11_023233_create_pf_custom_fields_table', 1),
	(55, '2023_09_13_042633_add_columns_to_pf_projects_table', 1),
	(56, '2023_09_13_044041_create_pf_project_categories_table', 1),
	(57, '2023_09_14_021936_update_index_for_slugs_table', 1),
	(58, '2023_09_14_022423_add_index_for_language_table', 1),
	(59, '2023_09_22_061723_create_custom_fields_translations_table', 1),
	(60, '2023_09_22_343531_remove_project_categories_table', 1),
	(61, '2023_11_05_081701_fix_projects_table', 1),
	(62, '2023_11_10_080225_migrate_contact_blacklist_email_domains_to_core', 1),
	(63, '2023_11_14_033417_change_request_column_in_table_audit_histories', 1),
	(64, '2023_11_17_063408_add_description_column_to_faq_categories_table', 1),
	(65, '2023_12_07_095130_add_color_column_to_media_folders_table', 1),
	(66, '2023_12_12_105220_drop_translations_table', 1),
	(67, '2023_12_17_162208_make_sure_column_color_in_media_folders_nullable', 1),
	(68, '2024_01_16_050056_create_comments_table', 1),
	(69, '2024_03_20_080001_migrate_change_attribute_email_to_nullable_form_contacts_table', 1),
	(70, '2024_03_25_000001_update_captcha_settings_for_contact', 1),
	(71, '2024_03_25_000001_update_captcha_settings_for_newsletter', 1),
	(72, '2024_04_04_110758_update_value_column_in_user_meta_table', 1),
	(73, '2024_04_19_063914_create_custom_fields_table', 1),
	(74, '2024_04_27_100730_improve_analytics_setting', 1),
	(75, '2024_05_12_091229_add_column_visibility_to_table_media_files', 1),
	(76, '2024_05_16_060328_add_projects_translations_table', 1),
	(77, '2024_07_07_091316_fix_column_url_in_menu_nodes_table', 1),
	(78, '2024_07_12_100000_change_random_hash_for_media', 1),
	(79, '2024_07_30_091615_fix_order_column_in_categories_table', 1),
	(80, '2024_09_09_075552_add_action_field_pf_packages_table', 1),
	(81, '2024_09_30_024515_create_sessions_table', 1),
	(82, '2024_11_14_024038_improve_pf_packages_table', 1),
	(83, '2024_12_19_000001_create_device_tokens_table', 1),
	(84, '2024_12_19_000002_create_push_notifications_table', 1),
	(85, '2024_12_19_000003_create_push_notification_recipients_table', 1),
	(86, '2024_12_30_000001_create_user_settings_table', 1),
	(87, '2025_01_06_033807_add_default_value_for_categories_author_type', 1),
	(88, '2025_01_19_145943_add_column_order_to_table_pf_services', 1),
	(89, '2025_02_11_153025_add_action_label_to_announcement_translations', 1),
	(90, '2025_05_05_000001_add_user_type_to_audit_histories_table', 1),
	(91, '2025_07_06_030754_add_phone_to_users_table', 1),
	(92, '2025_07_31_add_performance_indexes_to_slugs_table', 1);

-- membuang struktur untuk table ucuy.newsletters
CREATE TABLE IF NOT EXISTS `newsletters` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'subscribed',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.newsletters: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.pages
CREATE TABLE IF NOT EXISTS `pages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `user_id` bigint unsigned DEFAULT NULL,
  `image` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `template` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pages_user_id_index` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.pages: ~7 rows (lebih kurang)
INSERT INTO `pages` (`id`, `name`, `content`, `user_id`, `image`, `template`, `description`, `status`, `created_at`, `updated_at`) VALUES
	(1, 'Home', '<shortcode>[hero-banner style="2" title="Specialist &lt;span&gt;{Digital}&lt;/span&gt;Polymath" subtitle="Hey, I’m Yusuf Efendi" description="Membangun sistem, mengotomatisasi proses, dan mendominasi kompetisi. Saya menggabungkan keahlian teknis Engineering dan AI dengan strategi Digital Marketing berbasis data untuk menciptakan solusi digital yang efisien, scalable, dan berorientasi pada hasil." primary_button_text="Download My CV" primary_button_link="/storage/main/resume/cv.pdf" primary_button_icon="ti ti-download" open_primary_link_in_the_new_tab="yes" open_secondary_link_in_the_new_tab="no" below_button_text="...and more" quantity="5" name_1="Next.js" image_1="1.png" name_2="Firebase" image_2="2.png" name_3="MongoDB" image_3="3.png" name_4="Node.js" image_4="4.png" name_5="Tailwind CSS" image_5="5.png" background_image="code/general/hero-bg.png" background_image_dark="code/general/hero-bg-dark.png" right_image="photo-2025-09-26-19-07-38-1.jpg" right_image_shape="code/general/people-shape.png" filter_gray_image_in_dark_mode="yes" enable_lazy_loading="no"][/hero-banner]</shortcode><shortcode>[stats-counter style="2" quantity="4" label_1="Years Experience" icon_1="ti ti-crown" count_1="12" label_2="Projects Completed" icon_2="ti ti-device-desktop" count_2="250" label_3="Satisfied Clients" icon_3="ti ti-heart-spark" count_3="680" label_4="Awards Winner" icon_4="ti ti-award" count_4="18" background_image="code/general/static-bg.png" enable_lazy_loading="no"][/stats-counter]</shortcode><shortcode>[expertise-tabs title="My Expertise" subtitle="Combining technical engineering skills with AI automation capabilities and data-driven digital marketing strategies to deliver comprehensive, scalable solutions." enable_lazy_loading="yes"][/expertise-tabs]</shortcode><shortcode>[experience title="+12 &lt;span&gt;years of&lt;/span&gt; passion &lt;span&gt;for &lt;br /&gt; programming techniques&lt;/span&gt;" subtitle="Experience" role_title="Senior Software Engineer" role_description="Led development of scalable web applications, &lt;span&gt;improving performance&lt;/span&gt; and user experience for millions of users. Implemented machine learning algorithms to enhance search functionality. Collaborated with cross-functional teams to integrate new features seamlessly." experiences_quantity="4" experiences_date_1="2020- Present" experiences_title_1="Digital Creative Solution" experiences_logo_1="icon-1.png" experiences_date_2="2018 - 2020" experiences_title_2="Haribima IT Consultant" experiences_logo_2="haribimait.png" experiences_date_3="2017 - 2018" experiences_title_3="IT Development" experiences_logo_3="itd.png" experiences_date_4="2016 - 2017" experiences_title_4="Haribima IT Consultant" experiences_logo_4="haribimait.png" skills_quantity="5" skills_name_1="Python" skills_name_2="TensorFlow" skills_name_3="Angular" skills_name_4="Kubernetes" skills_name_5="GCP" background_image="code/general/services-bg.png" enable_lazy_loading="yes"][/experience]</shortcode><shortcode>[resume style="2" resume_1_title="Education" resume_1_title_icon="ti ti-school" resume_1_quantity="3" resume_1_time_1="2011 - 2013" resume_1_title_1="Lulus" resume_1_subtitle_1="SMK Teknik Informatika Al-Asiyah" resume_1_image_1="464370286-1902198303591946-9062885145854930439-n.jpg" resume_1_time_2="2017 - 2018" resume_1_title_2="Certification in Web Dev" resume_1_subtitle_2="University of Stanford" resume_1_time_3="2014 - 2016" resume_1_title_3="Advanced UX/UI Bootcamp" resume_1_subtitle_3="Design Academy" resume_1_time_4="2012 - 2013" resume_1_title_4="Certification in Graphic Design" resume_1_subtitle_4="Coursera" resume_2_title="Experience" resume_2_title_icon="ti ti-stars" resume_2_quantity="4" resume_2_time_1="2019 - Present" resume_2_title_1="Senior UI/UX Designer" resume_2_subtitle_1="Leader in Creative team" resume_2_time_2="2016 - 2019" resume_2_title_2="UI/UX Designer" resume_2_subtitle_2="Tech Startup" resume_2_time_3="2014 - 2016" resume_2_title_3="Freelance UI/UX Designer" resume_2_subtitle_3="Self-Employed" resume_2_time_4="2012 - 2014" resume_2_title_4="Junior UI Designer" resume_2_subtitle_4="Web Solutions team" enable_lazy_loading="yes"][/resume]</shortcode><shortcode>[projects style="2" title="My Recent Works" subtitle="Projects" project_ids="1,2,3,4" background_image="code/general/projects-bg.png" enable_lazy_loading="yes"][/projects]</shortcode><shortcode>[skills style="2" title="My Skills" subtitle="Projects" quantity="9" name_1="Next.js" image_1="nextjs-1.png" level_1="90%" name_2="Firebase" image_2="firebase-1.png" level_2="89%" name_3="MongoDB" image_3="mongodb-1.png" level_3="85%" name_4="Node.js" image_4="nodejs.png" level_4="92%" name_5="Tailwind CSS" image_5="tailwind-css-logo-rounded-free-png.webp" name_6="React" image_6="1183672.png" name_7="Vue.js" image_7="vuejs.png" name_8="Angular" image_8="angular.png" name_9="Laravel" image_9="laravel.png" list_quantity="5" list_label_1="Front-End" list_content_1="HTML, CSS, JavaScript, React, Angular" list_label_2="Back-End" list_content_2="Node.js, Express, Python, Django" list_label_3="Databases" list_content_3="MySQL, PostgreSQL, MongoDB" list_label_4="Tools &amp; Platforms" list_content_4="Git, Docker, AWS, Heroku" list_label_5="Others" list_content_5="RESTful APIs, GraphQL, Agile Methodologies" enable_lazy_loading="yes"][/skills]</shortcode><shortcode>[blog-posts style="2" paginate="3" title="Recent blog" subtitle="Latest Posts" enable_lazy_loading="yes"][/blog-posts]</shortcode><shortcode>[contact-form style="2" display_fields="phone,email,subject,address" mandatory_fields="email,subject" title="Let\'s connect" quantity="4" label_1="Phone" content_1="+1-234-567-8901" icon_1="ti ti-phone" url_1="tel:+1-234-567-8901" label_2="Email" content_2="contact@botble.com" icon_2="ti ti-mail" url_2="mailto:contact@botble.com" label_3="X (Twitter)" content_3="Botble Technologies" icon_3="ti ti-user" url_3="https://x.com/botble" label_4="Address" content_4="0811 Erdman Prairie, Joaville CA" icon_4="ti ti-map" url_4="https://google.com/maps"][/contact-form]</shortcode>', 1, NULL, 'default', '', 'published', '2025-09-11 19:44:36', '2025-12-31 07:30:26'),
	(2, 'Services', '[services style=&quot;4&quot; enable_lazy_loading=&quot;no&quot;][/services]', 1, NULL, 'has-heading', '\n                With expertise in mobile app and web design, I transform ideas into visually\n                stunning and user-friendly interfaces that captivate and retain users.\n                Explore my work and see design in action.', 'published', '2025-09-11 19:44:36', '2025-09-11 19:44:36'),
	(3, 'Projects', '[projects style=&quot;4&quot; enable_lazy_loading=&quot;no&quot;][/projects]', 1, NULL, 'has-heading', '\n                With expertise in mobile app and web design, I transform ideas into visually\n                stunning and user-friendly interfaces that captivate and retain users.\n                Explore my work and see design in action.', 'published', '2025-09-11 19:44:36', '2025-09-11 19:44:36'),
	(4, 'Pricing', '[pricing-plans package_ids=&quot;&quot; enable_lazy_loading=&quot;no&quot;][/pricing-plans]\n[faqs title=&quot;Common Questions&quot; category_ids=&quot;&quot; enable_lazy_loading=&quot;no&quot;][/faqs]', 1, NULL, 'has-heading', 'Flexible Plans Tailored to Meet Your Unique Needs, Ensuring High-Quality Services\n                Without Breaking the Bank', 'published', '2025-09-11 19:44:36', '2025-09-11 19:44:36'),
	(5, 'Blog', '', 1, NULL, 'has-heading', 'Discover key insights and emerging trends shaping the future of design: a detailed\n                examination of how these innovations are reshaping our industry', 'published', '2025-09-11 19:44:36', '2025-09-11 19:44:36'),
	(6, 'Contact', '[contact-form style=&quot;2&quot; display_fields=&quot;phone,email,subject,address&quot; mandatory_fields=&quot;email,subject&quot; title=&quot;Let&#039;s connect&quot; quantity=&quot;4&quot; label_1=&quot;Phone&quot; content_1=&quot;+1-234-567-8901&quot; icon_1=&quot;ti ti-phone&quot; url_1=&quot;tel:+1-234-567-8901&quot; label_2=&quot;Email&quot; content_2=&quot;contact@botble.com&quot; icon_2=&quot;ti ti-mail&quot; url_2=&quot;mailto:contact@botble.com&quot; label_3=&quot;X (Twitter)&quot; content_3=&quot;Botble Technologies&quot; icon_3=&quot;ti ti-user&quot; url_3=&quot;https://x.com/botble&quot; label_4=&quot;Address&quot; content_4=&quot;0811 Erdman Prairie, Joaville CA&quot; icon_4=&quot;ti ti-map&quot; url_4=&quot;https://google.com/maps&quot;][/contact-form]', 1, NULL, 'has-heading', NULL, 'published', '2025-09-11 19:44:36', '2025-09-11 19:44:36'),
	(7, 'Cookie Policy', '<h3>EU Cookie Consent</h3><p>To use this website we are using Cookies and collecting some Data. To be compliant with the EU GDPR we give you to choose if you allow us to use certain Cookies and to collect some Data.</p><h4>Essential Data</h4><p>The Essential Data is needed to run the Site you are visiting technically. You can not deactivate them.</p><p>- Session Cookie: PHP uses a Cookie to identify user sessions. Without this Cookie the Website is not working.</p><p>- XSRF-Token Cookie: Laravel automatically generates a CSRF "token" for each active user session managed by the application. This token is used to verify that the authenticated user is the one actually making the requests to the application.</p>', 1, NULL, 'has-heading', NULL, 'published', '2025-09-11 19:44:36', '2025-09-11 19:44:36');

-- membuang struktur untuk table ucuy.pages_translations
CREATE TABLE IF NOT EXISTS `pages_translations` (
  `lang_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `pages_id` bigint unsigned NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`lang_code`,`pages_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.pages_translations: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.password_reset_tokens
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.password_reset_tokens: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.personal_access_tokens
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.personal_access_tokens: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.pf_custom_field_options
CREATE TABLE IF NOT EXISTS `pf_custom_field_options` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `custom_field_id` bigint unsigned NOT NULL,
  `label` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `value` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order` int NOT NULL DEFAULT '999',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pf_custom_field_options_custom_field_id_index` (`custom_field_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.pf_custom_field_options: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.pf_custom_field_options_translations
CREATE TABLE IF NOT EXISTS `pf_custom_field_options_translations` (
  `lang_code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `value` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pf_custom_field_options_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`lang_code`,`pf_custom_field_options_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.pf_custom_field_options_translations: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.pf_custom_fields
CREATE TABLE IF NOT EXISTS `pf_custom_fields` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `author_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `author_id` bigint unsigned NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `placeholder` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `required` tinyint(1) NOT NULL DEFAULT '0',
  `type` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order` int NOT NULL DEFAULT '999',
  `status` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pf_custom_fields_author_type_author_id_index` (`author_type`,`author_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.pf_custom_fields: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.pf_custom_fields_translations
CREATE TABLE IF NOT EXISTS `pf_custom_fields_translations` (
  `lang_code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `placeholder` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pf_custom_fields_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`lang_code`,`pf_custom_fields_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.pf_custom_fields_translations: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.pf_packages
CREATE TABLE IF NOT EXISTS `pf_packages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `price` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `annual_price` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'monthly',
  `features` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `is_popular` tinyint(1) NOT NULL DEFAULT '0',
  `action_label` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action_url` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `order` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.pf_packages: ~2 rows (lebih kurang)
INSERT INTO `pf_packages` (`id`, `name`, `description`, `content`, `price`, `annual_price`, `duration`, `features`, `status`, `is_popular`, `action_label`, `action_url`, `created_at`, `updated_at`, `order`) VALUES
	(1, 'Basic', 'For small businesses and startups.', '', '$49', NULL, 'hourly', 'Require your wireframe\nDesign using Figma, Framer\nDevelop with Webflow, React, WordPress, Laravel/PHP\nRemote/Online collaboration\nAvailable on business days, no weekends\n6 months of support', 'published', 0, 'Get Started', '/contact', '2025-09-11 19:44:30', '2025-09-11 19:44:30', 0),
	(2, 'Business', 'For growing businesses and agencies.', '', '$99', NULL, 'hourly', 'No wireframe needed\nDesign using Figma, Framer\nDevelop with Webflow, React, WordPress, Laravel/PHP\nRemote/Online collaboration\nAvailable on business days, no weekends\n12 months of support\nYour project is always a priority\nCustomer care gifts included', 'published', 0, 'Get Started', '/contact', '2025-09-11 19:44:30', '2025-09-11 19:44:30', 0);

-- membuang struktur untuk table ucuy.pf_packages_translations
CREATE TABLE IF NOT EXISTS `pf_packages_translations` (
  `lang_code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `pf_packages_id` bigint unsigned NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `price` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `annual_price` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `features` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `action_label` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action_url` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`lang_code`,`pf_packages_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.pf_packages_translations: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.pf_projects
CREATE TABLE IF NOT EXISTS `pf_projects` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `place` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `client` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `image` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `images` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `views` int NOT NULL DEFAULT '0',
  `status` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `author` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `order` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.pf_projects: ~4 rows (lebih kurang)
INSERT INTO `pf_projects` (`id`, `name`, `description`, `content`, `place`, `client`, `is_featured`, `image`, `images`, `views`, `status`, `created_at`, `updated_at`, `author`, `start_date`, `order`) VALUES
	(1, 'CRM System', 'A custom-built CRM system with real-time data synchronization and multi-user support.', '<h5 class="fs-5 fw-medium">Description</h5>\n<p class="text-300">Travila is a comprehensive travel booking app designed to provide users with a seamless and enjoyable booking experience. The project involved creating an intuitive and visually appealing user interface, ensuring that users can effortlessly book flights, hotels, and car rentals all within a single app. The primary goal was to enhance the overall user experience, making travel planning easy and enjoyable.</p>\n<h5 class="fs-5 fw-medium mt-4">Key Features</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">User-Centric Interface: <span class="text-300 fw-medium">Designed a clean and intuitive interface that allows users to navigate through the app with ease, ensuring a smooth and enjoyable booking process.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Integrated Search and Booking: <span class="text-300 fw-medium">Developed an integrated search function that enables users to find and book flights, hotels, and car rentals quickly and efficiently.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Personalized Recommendations: <span class="text-300 fw-medium">Implemented a recommendation system that suggests destinations, accommodations, and activities based on user preferences and past behaviors.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">\n            Secure Payment Gateway: <span class="text-300 fw-medium">Integrated a secure payment gateway to ensure that all transactions <span class="text-dark fw-bold">are safe and user data is protected.</span></span>\n        </p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Interactive Maps: <span class="text-300 fw-medium">Added interactive maps to help users explore destinations, find nearby attractions, and get directions.</span></p>\n    </li>\n</ul>\n<h5 class="fs-5 fw-medium mt-4">Technologies Used</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">Front-End: <span class="text-300 fw-medium">React Native for cross-platform mobile development, ensuring a consistent experience on both iOS and Android devices.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Back-End: <span class="text-300 fw-medium">Node.js and Express for handling server-side logic and database interactions.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Database: <span class="text-300 fw-medium">MongoDB for flexible data storage and retrieval.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">APIs: <span class="text-300 fw-medium">Integrated third-party APIs for flight, hotel, and car rental bookings to provide a wide range of options to users.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Payment Integration: <span class="text-300 fw-medium">Stripe API for secure and reliable payment processing.</span></p>\n    </li>\n</ul>\n<h5 class="fs-5 fw-medium mt-4">Design Highlights</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">Visual Appeal: <span class="text-300 fw-medium">Focused on a visually appealing design with high-quality images and a modern color palette to enhance user engagement.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Usability: <span class="text-300 fw-medium">Ensured the app is user-friendly with clear icons, concise labels, and a straightforward navigation structure.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Responsive Design: <span class="text-300 fw-medium">Made the app responsive to different screen sizes and orientations, providing a consistent user experience across various devices.</span></p>\n    </li>\n</ul>\n', NULL, 'Corporate Client', 1, 'main/projects/1.png', NULL, 99, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30', NULL, '2023-06-01', 0),
	(2, 'E-Learning Platform', 'A scalable e-learning platform with integrated payment and live chat functionalities.', '<h5 class="fs-5 fw-medium">Description</h5>\n<p class="text-300">Travila is a comprehensive travel booking app designed to provide users with a seamless and enjoyable booking experience. The project involved creating an intuitive and visually appealing user interface, ensuring that users can effortlessly book flights, hotels, and car rentals all within a single app. The primary goal was to enhance the overall user experience, making travel planning easy and enjoyable.</p>\n<h5 class="fs-5 fw-medium mt-4">Key Features</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">User-Centric Interface: <span class="text-300 fw-medium">Designed a clean and intuitive interface that allows users to navigate through the app with ease, ensuring a smooth and enjoyable booking process.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Integrated Search and Booking: <span class="text-300 fw-medium">Developed an integrated search function that enables users to find and book flights, hotels, and car rentals quickly and efficiently.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Personalized Recommendations: <span class="text-300 fw-medium">Implemented a recommendation system that suggests destinations, accommodations, and activities based on user preferences and past behaviors.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">\n            Secure Payment Gateway: <span class="text-300 fw-medium">Integrated a secure payment gateway to ensure that all transactions <span class="text-dark fw-bold">are safe and user data is protected.</span></span>\n        </p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Interactive Maps: <span class="text-300 fw-medium">Added interactive maps to help users explore destinations, find nearby attractions, and get directions.</span></p>\n    </li>\n</ul>\n<h5 class="fs-5 fw-medium mt-4">Technologies Used</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">Front-End: <span class="text-300 fw-medium">React Native for cross-platform mobile development, ensuring a consistent experience on both iOS and Android devices.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Back-End: <span class="text-300 fw-medium">Node.js and Express for handling server-side logic and database interactions.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Database: <span class="text-300 fw-medium">MongoDB for flexible data storage and retrieval.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">APIs: <span class="text-300 fw-medium">Integrated third-party APIs for flight, hotel, and car rental bookings to provide a wide range of options to users.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Payment Integration: <span class="text-300 fw-medium">Stripe API for secure and reliable payment processing.</span></p>\n    </li>\n</ul>\n<h5 class="fs-5 fw-medium mt-4">Design Highlights</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">Visual Appeal: <span class="text-300 fw-medium">Focused on a visually appealing design with high-quality images and a modern color palette to enhance user engagement.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Usability: <span class="text-300 fw-medium">Ensured the app is user-friendly with clear icons, concise labels, and a straightforward navigation structure.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Responsive Design: <span class="text-300 fw-medium">Made the app responsive to different screen sizes and orientations, providing a consistent user experience across various devices.</span></p>\n    </li>\n</ul>\n', NULL, 'Education Startup', 1, 'main/projects/2.png', NULL, 1158, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30', NULL, '2023-03-15', 0),
	(3, 'Mobile Banking App', 'A secure and user-friendly mobile banking app for managing personal finances.', '<h5 class="fs-5 fw-medium">Description</h5>\n<p class="text-300">Travila is a comprehensive travel booking app designed to provide users with a seamless and enjoyable booking experience. The project involved creating an intuitive and visually appealing user interface, ensuring that users can effortlessly book flights, hotels, and car rentals all within a single app. The primary goal was to enhance the overall user experience, making travel planning easy and enjoyable.</p>\n<h5 class="fs-5 fw-medium mt-4">Key Features</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">User-Centric Interface: <span class="text-300 fw-medium">Designed a clean and intuitive interface that allows users to navigate through the app with ease, ensuring a smooth and enjoyable booking process.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Integrated Search and Booking: <span class="text-300 fw-medium">Developed an integrated search function that enables users to find and book flights, hotels, and car rentals quickly and efficiently.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Personalized Recommendations: <span class="text-300 fw-medium">Implemented a recommendation system that suggests destinations, accommodations, and activities based on user preferences and past behaviors.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">\n            Secure Payment Gateway: <span class="text-300 fw-medium">Integrated a secure payment gateway to ensure that all transactions <span class="text-dark fw-bold">are safe and user data is protected.</span></span>\n        </p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Interactive Maps: <span class="text-300 fw-medium">Added interactive maps to help users explore destinations, find nearby attractions, and get directions.</span></p>\n    </li>\n</ul>\n<h5 class="fs-5 fw-medium mt-4">Technologies Used</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">Front-End: <span class="text-300 fw-medium">React Native for cross-platform mobile development, ensuring a consistent experience on both iOS and Android devices.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Back-End: <span class="text-300 fw-medium">Node.js and Express for handling server-side logic and database interactions.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Database: <span class="text-300 fw-medium">MongoDB for flexible data storage and retrieval.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">APIs: <span class="text-300 fw-medium">Integrated third-party APIs for flight, hotel, and car rental bookings to provide a wide range of options to users.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Payment Integration: <span class="text-300 fw-medium">Stripe API for secure and reliable payment processing.</span></p>\n    </li>\n</ul>\n<h5 class="fs-5 fw-medium mt-4">Design Highlights</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">Visual Appeal: <span class="text-300 fw-medium">Focused on a visually appealing design with high-quality images and a modern color palette to enhance user engagement.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Usability: <span class="text-300 fw-medium">Ensured the app is user-friendly with clear icons, concise labels, and a straightforward navigation structure.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Responsive Design: <span class="text-300 fw-medium">Made the app responsive to different screen sizes and orientations, providing a consistent user experience across various devices.</span></p>\n    </li>\n</ul>\n', NULL, 'Finance Company', 0, 'main/projects/3.png', NULL, 642, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30', NULL, '2022-09-10', 0),
	(4, 'Cloud Infrastructure Setup', 'Set up a scalable and secure cloud infrastructure with automated monitoring and logging.', '<h5 class="fs-5 fw-medium">Description</h5>\n<p class="text-300">Travila is a comprehensive travel booking app designed to provide users with a seamless and enjoyable booking experience. The project involved creating an intuitive and visually appealing user interface, ensuring that users can effortlessly book flights, hotels, and car rentals all within a single app. The primary goal was to enhance the overall user experience, making travel planning easy and enjoyable.</p>\n<h5 class="fs-5 fw-medium mt-4">Key Features</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">User-Centric Interface: <span class="text-300 fw-medium">Designed a clean and intuitive interface that allows users to navigate through the app with ease, ensuring a smooth and enjoyable booking process.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Integrated Search and Booking: <span class="text-300 fw-medium">Developed an integrated search function that enables users to find and book flights, hotels, and car rentals quickly and efficiently.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Personalized Recommendations: <span class="text-300 fw-medium">Implemented a recommendation system that suggests destinations, accommodations, and activities based on user preferences and past behaviors.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">\n            Secure Payment Gateway: <span class="text-300 fw-medium">Integrated a secure payment gateway to ensure that all transactions <span class="text-dark fw-bold">are safe and user data is protected.</span></span>\n        </p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Interactive Maps: <span class="text-300 fw-medium">Added interactive maps to help users explore destinations, find nearby attractions, and get directions.</span></p>\n    </li>\n</ul>\n<h5 class="fs-5 fw-medium mt-4">Technologies Used</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">Front-End: <span class="text-300 fw-medium">React Native for cross-platform mobile development, ensuring a consistent experience on both iOS and Android devices.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Back-End: <span class="text-300 fw-medium">Node.js and Express for handling server-side logic and database interactions.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Database: <span class="text-300 fw-medium">MongoDB for flexible data storage and retrieval.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">APIs: <span class="text-300 fw-medium">Integrated third-party APIs for flight, hotel, and car rental bookings to provide a wide range of options to users.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Payment Integration: <span class="text-300 fw-medium">Stripe API for secure and reliable payment processing.</span></p>\n    </li>\n</ul>\n<h5 class="fs-5 fw-medium mt-4">Design Highlights</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">Visual Appeal: <span class="text-300 fw-medium">Focused on a visually appealing design with high-quality images and a modern color palette to enhance user engagement.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Usability: <span class="text-300 fw-medium">Ensured the app is user-friendly with clear icons, concise labels, and a straightforward navigation structure.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Responsive Design: <span class="text-300 fw-medium">Made the app responsive to different screen sizes and orientations, providing a consistent user experience across various devices.</span></p>\n    </li>\n</ul>\n', NULL, 'Tech Company', 1, 'main/projects/4.png', NULL, 2226, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30', NULL, '2023-04-20', 0);

-- membuang struktur untuk table ucuy.pf_projects_translations
CREATE TABLE IF NOT EXISTS `pf_projects_translations` (
  `lang_code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `pf_projects_id` bigint unsigned NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.pf_projects_translations: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.pf_quotes
CREATE TABLE IF NOT EXISTS `pf_quotes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fields` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unread',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.pf_quotes: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.pf_service_categories
CREATE TABLE IF NOT EXISTS `pf_service_categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` bigint unsigned DEFAULT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order` tinyint NOT NULL DEFAULT '0',
  `status` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pf_service_categories_parent_id_index` (`parent_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.pf_service_categories: ~4 rows (lebih kurang)
INSERT INTO `pf_service_categories` (`id`, `parent_id`, `name`, `description`, `image`, `order`, `status`, `created_at`, `updated_at`) VALUES
	(1, NULL, 'Backend Development', 'Server-side development with robust, scalable architectures.', NULL, 0, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(2, NULL, 'Frontend Development', 'Building interactive and responsive web interfaces using modern technologies.', NULL, 0, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(3, NULL, 'Mobile App Development', 'Developing cross-platform mobile applications for Android and iOS.', NULL, 0, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(4, NULL, 'DevOps & Cloud', 'Cloud-based services and infrastructure management with CI/CD practices.', NULL, 0, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30');

-- membuang struktur untuk table ucuy.pf_service_categories_translations
CREATE TABLE IF NOT EXISTS `pf_service_categories_translations` (
  `lang_code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `pf_service_categories_id` bigint unsigned NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`lang_code`,`pf_service_categories_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.pf_service_categories_translations: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.pf_services
CREATE TABLE IF NOT EXISTS `pf_services` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category_id` bigint unsigned NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `image` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `images` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `views` int NOT NULL DEFAULT '0',
  `status` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `order` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `pf_services_category_id_index` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.pf_services: ~6 rows (lebih kurang)
INSERT INTO `pf_services` (`id`, `category_id`, `name`, `description`, `content`, `is_featured`, `image`, `images`, `views`, `status`, `created_at`, `updated_at`, `order`) VALUES
	(1, 1, 'API Development', 'Designing and developing scalable RESTful APIs for web and mobile applications.', '<h5 class="fs-5 fw-medium">Description</h5>\n<p class="text-300">Travila is a comprehensive travel booking app designed to provide users with a seamless and enjoyable booking experience. The project involved creating an intuitive and visually appealing user interface, ensuring that users can effortlessly book flights, hotels, and car rentals all within a single app. The primary goal was to enhance the overall user experience, making travel planning easy and enjoyable.</p>\n<h5 class="fs-5 fw-medium mt-4">Key Features</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">User-Centric Interface: <span class="text-300 fw-medium">Designed a clean and intuitive interface that allows users to navigate through the app with ease, ensuring a smooth and enjoyable booking process.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Integrated Search and Booking: <span class="text-300 fw-medium">Developed an integrated search function that enables users to find and book flights, hotels, and car rentals quickly and efficiently.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Personalized Recommendations: <span class="text-300 fw-medium">Implemented a recommendation system that suggests destinations, accommodations, and activities based on user preferences and past behaviors.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">\n            Secure Payment Gateway: <span class="text-300 fw-medium">Integrated a secure payment gateway to ensure that all transactions <span class="text-dark fw-bold">are safe and user data is protected.</span></span>\n        </p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Interactive Maps: <span class="text-300 fw-medium">Added interactive maps to help users explore destinations, find nearby attractions, and get directions.</span></p>\n    </li>\n</ul>\n<h5 class="fs-5 fw-medium mt-4">Technologies Used</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">Front-End: <span class="text-300 fw-medium">React Native for cross-platform mobile development, ensuring a consistent experience on both iOS and Android devices.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Back-End: <span class="text-300 fw-medium">Node.js and Express for handling server-side logic and database interactions.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Database: <span class="text-300 fw-medium">MongoDB for flexible data storage and retrieval.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">APIs: <span class="text-300 fw-medium">Integrated third-party APIs for flight, hotel, and car rental bookings to provide a wide range of options to users.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Payment Integration: <span class="text-300 fw-medium">Stripe API for secure and reliable payment processing.</span></p>\n    </li>\n</ul>\n<h5 class="fs-5 fw-medium mt-4">Design Highlights</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">Visual Appeal: <span class="text-300 fw-medium">Focused on a visually appealing design with high-quality images and a modern color palette to enhance user engagement.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Usability: <span class="text-300 fw-medium">Ensured the app is user-friendly with clear icons, concise labels, and a straightforward navigation structure.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Responsive Design: <span class="text-300 fw-medium">Made the app responsive to different screen sizes and orientations, providing a consistent user experience across various devices.</span></p>\n    </li>\n</ul>\n', 0, NULL, NULL, 9984, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30', 0),
	(2, 2, 'Frontend Development', 'Creating dynamic and interactive web pages using React, Vue, and other modern JS frameworks.', '<h5 class="fs-5 fw-medium">Description</h5>\n<p class="text-300">Travila is a comprehensive travel booking app designed to provide users with a seamless and enjoyable booking experience. The project involved creating an intuitive and visually appealing user interface, ensuring that users can effortlessly book flights, hotels, and car rentals all within a single app. The primary goal was to enhance the overall user experience, making travel planning easy and enjoyable.</p>\n<h5 class="fs-5 fw-medium mt-4">Key Features</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">User-Centric Interface: <span class="text-300 fw-medium">Designed a clean and intuitive interface that allows users to navigate through the app with ease, ensuring a smooth and enjoyable booking process.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Integrated Search and Booking: <span class="text-300 fw-medium">Developed an integrated search function that enables users to find and book flights, hotels, and car rentals quickly and efficiently.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Personalized Recommendations: <span class="text-300 fw-medium">Implemented a recommendation system that suggests destinations, accommodations, and activities based on user preferences and past behaviors.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">\n            Secure Payment Gateway: <span class="text-300 fw-medium">Integrated a secure payment gateway to ensure that all transactions <span class="text-dark fw-bold">are safe and user data is protected.</span></span>\n        </p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Interactive Maps: <span class="text-300 fw-medium">Added interactive maps to help users explore destinations, find nearby attractions, and get directions.</span></p>\n    </li>\n</ul>\n<h5 class="fs-5 fw-medium mt-4">Technologies Used</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">Front-End: <span class="text-300 fw-medium">React Native for cross-platform mobile development, ensuring a consistent experience on both iOS and Android devices.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Back-End: <span class="text-300 fw-medium">Node.js and Express for handling server-side logic and database interactions.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Database: <span class="text-300 fw-medium">MongoDB for flexible data storage and retrieval.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">APIs: <span class="text-300 fw-medium">Integrated third-party APIs for flight, hotel, and car rental bookings to provide a wide range of options to users.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Payment Integration: <span class="text-300 fw-medium">Stripe API for secure and reliable payment processing.</span></p>\n    </li>\n</ul>\n<h5 class="fs-5 fw-medium mt-4">Design Highlights</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">Visual Appeal: <span class="text-300 fw-medium">Focused on a visually appealing design with high-quality images and a modern color palette to enhance user engagement.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Usability: <span class="text-300 fw-medium">Ensured the app is user-friendly with clear icons, concise labels, and a straightforward navigation structure.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Responsive Design: <span class="text-300 fw-medium">Made the app responsive to different screen sizes and orientations, providing a consistent user experience across various devices.</span></p>\n    </li>\n</ul>\n', 0, NULL, NULL, 3520, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30', 0),
	(3, 3, 'Mobile App Development', 'Building cross-platform mobile applications using Flutter and React Native.', '<h5 class="fs-5 fw-medium">Description</h5>\n<p class="text-300">Travila is a comprehensive travel booking app designed to provide users with a seamless and enjoyable booking experience. The project involved creating an intuitive and visually appealing user interface, ensuring that users can effortlessly book flights, hotels, and car rentals all within a single app. The primary goal was to enhance the overall user experience, making travel planning easy and enjoyable.</p>\n<h5 class="fs-5 fw-medium mt-4">Key Features</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">User-Centric Interface: <span class="text-300 fw-medium">Designed a clean and intuitive interface that allows users to navigate through the app with ease, ensuring a smooth and enjoyable booking process.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Integrated Search and Booking: <span class="text-300 fw-medium">Developed an integrated search function that enables users to find and book flights, hotels, and car rentals quickly and efficiently.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Personalized Recommendations: <span class="text-300 fw-medium">Implemented a recommendation system that suggests destinations, accommodations, and activities based on user preferences and past behaviors.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">\n            Secure Payment Gateway: <span class="text-300 fw-medium">Integrated a secure payment gateway to ensure that all transactions <span class="text-dark fw-bold">are safe and user data is protected.</span></span>\n        </p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Interactive Maps: <span class="text-300 fw-medium">Added interactive maps to help users explore destinations, find nearby attractions, and get directions.</span></p>\n    </li>\n</ul>\n<h5 class="fs-5 fw-medium mt-4">Technologies Used</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">Front-End: <span class="text-300 fw-medium">React Native for cross-platform mobile development, ensuring a consistent experience on both iOS and Android devices.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Back-End: <span class="text-300 fw-medium">Node.js and Express for handling server-side logic and database interactions.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Database: <span class="text-300 fw-medium">MongoDB for flexible data storage and retrieval.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">APIs: <span class="text-300 fw-medium">Integrated third-party APIs for flight, hotel, and car rental bookings to provide a wide range of options to users.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Payment Integration: <span class="text-300 fw-medium">Stripe API for secure and reliable payment processing.</span></p>\n    </li>\n</ul>\n<h5 class="fs-5 fw-medium mt-4">Design Highlights</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">Visual Appeal: <span class="text-300 fw-medium">Focused on a visually appealing design with high-quality images and a modern color palette to enhance user engagement.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Usability: <span class="text-300 fw-medium">Ensured the app is user-friendly with clear icons, concise labels, and a straightforward navigation structure.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Responsive Design: <span class="text-300 fw-medium">Made the app responsive to different screen sizes and orientations, providing a consistent user experience across various devices.</span></p>\n    </li>\n</ul>\n', 1, NULL, NULL, 5634, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30', 0),
	(4, 1, 'DevOps Consulting', 'Implementing automated pipelines for continuous integration and delivery.', '<h5 class="fs-5 fw-medium">Description</h5>\n<p class="text-300">Travila is a comprehensive travel booking app designed to provide users with a seamless and enjoyable booking experience. The project involved creating an intuitive and visually appealing user interface, ensuring that users can effortlessly book flights, hotels, and car rentals all within a single app. The primary goal was to enhance the overall user experience, making travel planning easy and enjoyable.</p>\n<h5 class="fs-5 fw-medium mt-4">Key Features</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">User-Centric Interface: <span class="text-300 fw-medium">Designed a clean and intuitive interface that allows users to navigate through the app with ease, ensuring a smooth and enjoyable booking process.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Integrated Search and Booking: <span class="text-300 fw-medium">Developed an integrated search function that enables users to find and book flights, hotels, and car rentals quickly and efficiently.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Personalized Recommendations: <span class="text-300 fw-medium">Implemented a recommendation system that suggests destinations, accommodations, and activities based on user preferences and past behaviors.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">\n            Secure Payment Gateway: <span class="text-300 fw-medium">Integrated a secure payment gateway to ensure that all transactions <span class="text-dark fw-bold">are safe and user data is protected.</span></span>\n        </p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Interactive Maps: <span class="text-300 fw-medium">Added interactive maps to help users explore destinations, find nearby attractions, and get directions.</span></p>\n    </li>\n</ul>\n<h5 class="fs-5 fw-medium mt-4">Technologies Used</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">Front-End: <span class="text-300 fw-medium">React Native for cross-platform mobile development, ensuring a consistent experience on both iOS and Android devices.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Back-End: <span class="text-300 fw-medium">Node.js and Express for handling server-side logic and database interactions.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Database: <span class="text-300 fw-medium">MongoDB for flexible data storage and retrieval.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">APIs: <span class="text-300 fw-medium">Integrated third-party APIs for flight, hotel, and car rental bookings to provide a wide range of options to users.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Payment Integration: <span class="text-300 fw-medium">Stripe API for secure and reliable payment processing.</span></p>\n    </li>\n</ul>\n<h5 class="fs-5 fw-medium mt-4">Design Highlights</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">Visual Appeal: <span class="text-300 fw-medium">Focused on a visually appealing design with high-quality images and a modern color palette to enhance user engagement.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Usability: <span class="text-300 fw-medium">Ensured the app is user-friendly with clear icons, concise labels, and a straightforward navigation structure.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Responsive Design: <span class="text-300 fw-medium">Made the app responsive to different screen sizes and orientations, providing a consistent user experience across various devices.</span></p>\n    </li>\n</ul>\n', 0, NULL, NULL, 4688, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30', 0),
	(5, 1, 'Cloud Integration', 'Seamlessly integrating applications with cloud services like AWS, Azure, and Google Cloud.', '<h5 class="fs-5 fw-medium">Description</h5>\n<p class="text-300">Travila is a comprehensive travel booking app designed to provide users with a seamless and enjoyable booking experience. The project involved creating an intuitive and visually appealing user interface, ensuring that users can effortlessly book flights, hotels, and car rentals all within a single app. The primary goal was to enhance the overall user experience, making travel planning easy and enjoyable.</p>\n<h5 class="fs-5 fw-medium mt-4">Key Features</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">User-Centric Interface: <span class="text-300 fw-medium">Designed a clean and intuitive interface that allows users to navigate through the app with ease, ensuring a smooth and enjoyable booking process.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Integrated Search and Booking: <span class="text-300 fw-medium">Developed an integrated search function that enables users to find and book flights, hotels, and car rentals quickly and efficiently.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Personalized Recommendations: <span class="text-300 fw-medium">Implemented a recommendation system that suggests destinations, accommodations, and activities based on user preferences and past behaviors.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">\n            Secure Payment Gateway: <span class="text-300 fw-medium">Integrated a secure payment gateway to ensure that all transactions <span class="text-dark fw-bold">are safe and user data is protected.</span></span>\n        </p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Interactive Maps: <span class="text-300 fw-medium">Added interactive maps to help users explore destinations, find nearby attractions, and get directions.</span></p>\n    </li>\n</ul>\n<h5 class="fs-5 fw-medium mt-4">Technologies Used</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">Front-End: <span class="text-300 fw-medium">React Native for cross-platform mobile development, ensuring a consistent experience on both iOS and Android devices.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Back-End: <span class="text-300 fw-medium">Node.js and Express for handling server-side logic and database interactions.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Database: <span class="text-300 fw-medium">MongoDB for flexible data storage and retrieval.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">APIs: <span class="text-300 fw-medium">Integrated third-party APIs for flight, hotel, and car rental bookings to provide a wide range of options to users.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Payment Integration: <span class="text-300 fw-medium">Stripe API for secure and reliable payment processing.</span></p>\n    </li>\n</ul>\n<h5 class="fs-5 fw-medium mt-4">Design Highlights</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">Visual Appeal: <span class="text-300 fw-medium">Focused on a visually appealing design with high-quality images and a modern color palette to enhance user engagement.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Usability: <span class="text-300 fw-medium">Ensured the app is user-friendly with clear icons, concise labels, and a straightforward navigation structure.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Responsive Design: <span class="text-300 fw-medium">Made the app responsive to different screen sizes and orientations, providing a consistent user experience across various devices.</span></p>\n    </li>\n</ul>\n', 0, NULL, NULL, 7691, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30', 0),
	(6, 1, 'Database Management', 'Managing and optimizing relational and non-relational databases for high performance.', '<h5 class="fs-5 fw-medium">Description</h5>\n<p class="text-300">Travila is a comprehensive travel booking app designed to provide users with a seamless and enjoyable booking experience. The project involved creating an intuitive and visually appealing user interface, ensuring that users can effortlessly book flights, hotels, and car rentals all within a single app. The primary goal was to enhance the overall user experience, making travel planning easy and enjoyable.</p>\n<h5 class="fs-5 fw-medium mt-4">Key Features</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">User-Centric Interface: <span class="text-300 fw-medium">Designed a clean and intuitive interface that allows users to navigate through the app with ease, ensuring a smooth and enjoyable booking process.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Integrated Search and Booking: <span class="text-300 fw-medium">Developed an integrated search function that enables users to find and book flights, hotels, and car rentals quickly and efficiently.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Personalized Recommendations: <span class="text-300 fw-medium">Implemented a recommendation system that suggests destinations, accommodations, and activities based on user preferences and past behaviors.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">\n            Secure Payment Gateway: <span class="text-300 fw-medium">Integrated a secure payment gateway to ensure that all transactions <span class="text-dark fw-bold">are safe and user data is protected.</span></span>\n        </p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Interactive Maps: <span class="text-300 fw-medium">Added interactive maps to help users explore destinations, find nearby attractions, and get directions.</span></p>\n    </li>\n</ul>\n<h5 class="fs-5 fw-medium mt-4">Technologies Used</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">Front-End: <span class="text-300 fw-medium">React Native for cross-platform mobile development, ensuring a consistent experience on both iOS and Android devices.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Back-End: <span class="text-300 fw-medium">Node.js and Express for handling server-side logic and database interactions.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Database: <span class="text-300 fw-medium">MongoDB for flexible data storage and retrieval.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">APIs: <span class="text-300 fw-medium">Integrated third-party APIs for flight, hotel, and car rental bookings to provide a wide range of options to users.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Payment Integration: <span class="text-300 fw-medium">Stripe API for secure and reliable payment processing.</span></p>\n    </li>\n</ul>\n<h5 class="fs-5 fw-medium mt-4">Design Highlights</h5>\n<ul>\n    <li>\n        <p class="text-dark fw-bold">Visual Appeal: <span class="text-300 fw-medium">Focused on a visually appealing design with high-quality images and a modern color palette to enhance user engagement.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Usability: <span class="text-300 fw-medium">Ensured the app is user-friendly with clear icons, concise labels, and a straightforward navigation structure.</span></p>\n    </li>\n    <li>\n        <p class="text-dark fw-bold">Responsive Design: <span class="text-300 fw-medium">Made the app responsive to different screen sizes and orientations, providing a consistent user experience across various devices.</span></p>\n    </li>\n</ul>\n', 1, NULL, NULL, 3902, 'published', '2025-09-11 19:44:30', '2025-09-11 19:44:30', 0);

-- membuang struktur untuk table ucuy.pf_services_translations
CREATE TABLE IF NOT EXISTS `pf_services_translations` (
  `lang_code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `pf_services_id` bigint unsigned NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`lang_code`,`pf_services_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.pf_services_translations: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.post_categories
CREATE TABLE IF NOT EXISTS `post_categories` (
  `category_id` bigint unsigned NOT NULL,
  `post_id` bigint unsigned NOT NULL,
  KEY `post_categories_category_id_index` (`category_id`),
  KEY `post_categories_post_id_index` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.post_categories: ~30 rows (lebih kurang)
INSERT INTO `post_categories` (`category_id`, `post_id`) VALUES
	(4, 1),
	(7, 1),
	(1, 2),
	(3, 2),
	(1, 3),
	(9, 3),
	(5, 4),
	(7, 4),
	(4, 5),
	(3, 5),
	(2, 6),
	(9, 6),
	(8, 7),
	(3, 7),
	(2, 8),
	(9, 8),
	(9, 9),
	(6, 9),
	(3, 10),
	(8, 10),
	(3, 11),
	(5, 11),
	(4, 12),
	(5, 12),
	(2, 13),
	(5, 13),
	(8, 14),
	(3, 14),
	(5, 15),
	(8, 15);

-- membuang struktur untuk table ucuy.post_tags
CREATE TABLE IF NOT EXISTS `post_tags` (
  `tag_id` bigint unsigned NOT NULL,
  `post_id` bigint unsigned NOT NULL,
  KEY `post_tags_tag_id_index` (`tag_id`),
  KEY `post_tags_post_id_index` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.post_tags: ~38 rows (lebih kurang)
INSERT INTO `post_tags` (`tag_id`, `post_id`) VALUES
	(1, 1),
	(6, 1),
	(4, 1),
	(4, 2),
	(5, 2),
	(8, 2),
	(4, 3),
	(6, 3),
	(1, 3),
	(2, 4),
	(7, 4),
	(3, 5),
	(5, 5),
	(4, 6),
	(7, 6),
	(8, 7),
	(5, 7),
	(7, 7),
	(1, 8),
	(4, 8),
	(7, 8),
	(6, 9),
	(5, 9),
	(1, 9),
	(2, 10),
	(6, 10),
	(1, 11),
	(8, 11),
	(1, 12),
	(3, 12),
	(6, 13),
	(3, 13),
	(5, 13),
	(8, 14),
	(1, 14),
	(1, 15),
	(4, 15),
	(3, 15);

-- membuang struktur untuk table ucuy.posts
CREATE TABLE IF NOT EXISTS `posts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `author_id` bigint unsigned DEFAULT NULL,
  `author_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_featured` tinyint unsigned NOT NULL DEFAULT '0',
  `image` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `views` int unsigned NOT NULL DEFAULT '0',
  `format_type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `posts_status_index` (`status`),
  KEY `posts_author_id_index` (`author_id`),
  KEY `posts_author_type_index` (`author_type`),
  KEY `posts_created_at_index` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.posts: ~15 rows (lebih kurang)
INSERT INTO `posts` (`id`, `name`, `description`, `content`, `status`, `author_id`, `author_type`, `is_featured`, `image`, `views`, `format_type`, `created_at`, `updated_at`) VALUES
	(1, 'Building a Full-Stack App with the TALL Stack', 'Learn how to build a full-stack web application using the TALL stack, integrating Laravel, Alpine.js, Tailwind CSS, and Livewire for dynamic and responsive web development.', '<h5>Prioritize User-Centric Design</h5>\n<h5 class="fs-5 fw-medium">Understand Your Users</h5>\n<p class="text-300">Conduct thorough user research to understand your target audience’s needs, preferences, and pain points. Use surveys, interviews, and usability testing to gather valuable insights.</p>\n<h5 class="fs-5 fw-medium">Simplify Navigation</h5>\n<p class="text-300">Design a clean and intuitive navigation structure. Ensure users can easily find what they’re looking for without feeling overwhelmed. Use familiar icons and clear labels to guide them.</p>\n<h5 class="mt-6">Optimize Performance</h5>\n<h5 class="fs-5 fw-medium">Fast Loading Times</h5>\n<p class="text-300">Optimize your app to load quickly. Users expect instant gratification, and slow load times can lead to frustration and app abandonment. Use efficient coding practices and minimize the use of heavy graphics.</p>\n<h5 class="fs-5 fw-medium">Smooth Animations</h5>\n<p class="text-300">Ensure animations and transitions are smooth and do not hinder the app’s performance. Well-executed animations can enhance the user experience by providing visual feedback and making interactions feel natural.</p>\n<h5 class="fs-5 fw-medium">Offline Access</h5>\n<p class="text-300">Provide offline capabilities for essential features. Allowing users to access certain functionalities without an internet connection can greatly improve their experience, especially in areas with poor connectivity.</p>\n<h5>Ensure Robust Security</h5>\n<h5 class="fs-5 fw-medium">Data Protection</h5>\n<p class="text-300">Implement strong security measures to protect user data. Use encryption, secure authentication methods, and regular security audits to safeguard sensitive information.</p>\n<h5 class="fs-5 fw-medium">Transparent Policies</h5>\n<p class="text-300">Be transparent about your data collection and usage policies. Provide users with clear information about how their data is used and give them control over their privacy settings.</p>\n<h5 class="fs-5 fw-medium">Regular Updates</h5>\n<p class="text-300">Keep your app updated with the latest security patches and improvements. Regular updates not only enhance security but also show users that you are actively maintaining and improving the app.</p>\n\n[highlighted-box title="Conclusion" description="Creating a seamless mobile experience requires a user-centric approach, performance optimization, responsive design, user engagement strategies, and robust security measures. By focusing on these key areas, you can build a mobile app that not only meets user expectations but also stands out in the competitive app market. Remember, a great mobile experience can turn users into loyal advocates, driving the success of your app."][/highlighted-box]\n', 'published', 1, 'Botble\\ACL\\Models\\User', 0, 'main/posts/1.png', 2420, NULL, '2025-03-15 02:52:32', '2025-09-11 19:44:28'),
	(2, 'My Journey in Open Source: 3 Years of Contributions', 'A personal reflection on my experiences contributing to open source projects over the past three years, sharing lessons learned and advice for aspiring contributors.', '<h5>Prioritize User-Centric Design</h5>\n<h5 class="fs-5 fw-medium">Understand Your Users</h5>\n<p class="text-300">Conduct thorough user research to understand your target audience’s needs, preferences, and pain points. Use surveys, interviews, and usability testing to gather valuable insights.</p>\n<h5 class="fs-5 fw-medium">Simplify Navigation</h5>\n<p class="text-300">Design a clean and intuitive navigation structure. Ensure users can easily find what they’re looking for without feeling overwhelmed. Use familiar icons and clear labels to guide them.</p>\n<h5 class="mt-6">Optimize Performance</h5>\n<h5 class="fs-5 fw-medium">Fast Loading Times</h5>\n<p class="text-300">Optimize your app to load quickly. Users expect instant gratification, and slow load times can lead to frustration and app abandonment. Use efficient coding practices and minimize the use of heavy graphics.</p>\n<h5 class="fs-5 fw-medium">Smooth Animations</h5>\n<p class="text-300">Ensure animations and transitions are smooth and do not hinder the app’s performance. Well-executed animations can enhance the user experience by providing visual feedback and making interactions feel natural.</p>\n<h5 class="fs-5 fw-medium">Offline Access</h5>\n<p class="text-300">Provide offline capabilities for essential features. Allowing users to access certain functionalities without an internet connection can greatly improve their experience, especially in areas with poor connectivity.</p>\n<h5>Ensure Robust Security</h5>\n<h5 class="fs-5 fw-medium">Data Protection</h5>\n<p class="text-300">Implement strong security measures to protect user data. Use encryption, secure authentication methods, and regular security audits to safeguard sensitive information.</p>\n<h5 class="fs-5 fw-medium">Transparent Policies</h5>\n<p class="text-300">Be transparent about your data collection and usage policies. Provide users with clear information about how their data is used and give them control over their privacy settings.</p>\n<h5 class="fs-5 fw-medium">Regular Updates</h5>\n<p class="text-300">Keep your app updated with the latest security patches and improvements. Regular updates not only enhance security but also show users that you are actively maintaining and improving the app.</p>\n\n[highlighted-box title="Conclusion" description="Creating a seamless mobile experience requires a user-centric approach, performance optimization, responsive design, user engagement strategies, and robust security measures. By focusing on these key areas, you can build a mobile app that not only meets user expectations but also stands out in the competitive app market. Remember, a great mobile experience can turn users into loyal advocates, driving the success of your app."][/highlighted-box]\n', 'published', 1, 'Botble\\ACL\\Models\\User', 0, 'main/posts/7.png', 1708, NULL, '2025-01-14 18:49:35', '2025-09-11 19:44:28'),
	(3, '5 Essential Tools for Web Developers in 2024', 'Discover the top 5 tools that are essential for web developers in 2024, from frameworks and libraries to productivity boosters.', '<h5>Prioritize User-Centric Design</h5>\n<h5 class="fs-5 fw-medium">Understand Your Users</h5>\n<p class="text-300">Conduct thorough user research to understand your target audience’s needs, preferences, and pain points. Use surveys, interviews, and usability testing to gather valuable insights.</p>\n<h5 class="fs-5 fw-medium">Simplify Navigation</h5>\n<p class="text-300">Design a clean and intuitive navigation structure. Ensure users can easily find what they’re looking for without feeling overwhelmed. Use familiar icons and clear labels to guide them.</p>\n<h5 class="mt-6">Optimize Performance</h5>\n<h5 class="fs-5 fw-medium">Fast Loading Times</h5>\n<p class="text-300">Optimize your app to load quickly. Users expect instant gratification, and slow load times can lead to frustration and app abandonment. Use efficient coding practices and minimize the use of heavy graphics.</p>\n<h5 class="fs-5 fw-medium">Smooth Animations</h5>\n<p class="text-300">Ensure animations and transitions are smooth and do not hinder the app’s performance. Well-executed animations can enhance the user experience by providing visual feedback and making interactions feel natural.</p>\n<h5 class="fs-5 fw-medium">Offline Access</h5>\n<p class="text-300">Provide offline capabilities for essential features. Allowing users to access certain functionalities without an internet connection can greatly improve their experience, especially in areas with poor connectivity.</p>\n<h5>Ensure Robust Security</h5>\n<h5 class="fs-5 fw-medium">Data Protection</h5>\n<p class="text-300">Implement strong security measures to protect user data. Use encryption, secure authentication methods, and regular security audits to safeguard sensitive information.</p>\n<h5 class="fs-5 fw-medium">Transparent Policies</h5>\n<p class="text-300">Be transparent about your data collection and usage policies. Provide users with clear information about how their data is used and give them control over their privacy settings.</p>\n<h5 class="fs-5 fw-medium">Regular Updates</h5>\n<p class="text-300">Keep your app updated with the latest security patches and improvements. Regular updates not only enhance security but also show users that you are actively maintaining and improving the app.</p>\n\n[highlighted-box title="Conclusion" description="Creating a seamless mobile experience requires a user-centric approach, performance optimization, responsive design, user engagement strategies, and robust security measures. By focusing on these key areas, you can build a mobile app that not only meets user expectations but also stands out in the competitive app market. Remember, a great mobile experience can turn users into loyal advocates, driving the success of your app."][/highlighted-box]\n', 'published', 1, 'Botble\\ACL\\Models\\User', 1, 'main/posts/4.png', 2194, NULL, '2025-04-12 02:38:51', '2025-09-11 19:44:28'),
	(4, 'How I Built My Personal Portfolio Using Botble CMS', 'A detailed walkthrough on how I built my portfolio website using Botble CMS, customizing it with the Zelio template for an impressive online presence.', '<h5>Prioritize User-Centric Design</h5>\n<h5 class="fs-5 fw-medium">Understand Your Users</h5>\n<p class="text-300">Conduct thorough user research to understand your target audience’s needs, preferences, and pain points. Use surveys, interviews, and usability testing to gather valuable insights.</p>\n<h5 class="fs-5 fw-medium">Simplify Navigation</h5>\n<p class="text-300">Design a clean and intuitive navigation structure. Ensure users can easily find what they’re looking for without feeling overwhelmed. Use familiar icons and clear labels to guide them.</p>\n<h5 class="mt-6">Optimize Performance</h5>\n<h5 class="fs-5 fw-medium">Fast Loading Times</h5>\n<p class="text-300">Optimize your app to load quickly. Users expect instant gratification, and slow load times can lead to frustration and app abandonment. Use efficient coding practices and minimize the use of heavy graphics.</p>\n<h5 class="fs-5 fw-medium">Smooth Animations</h5>\n<p class="text-300">Ensure animations and transitions are smooth and do not hinder the app’s performance. Well-executed animations can enhance the user experience by providing visual feedback and making interactions feel natural.</p>\n<h5 class="fs-5 fw-medium">Offline Access</h5>\n<p class="text-300">Provide offline capabilities for essential features. Allowing users to access certain functionalities without an internet connection can greatly improve their experience, especially in areas with poor connectivity.</p>\n<h5>Ensure Robust Security</h5>\n<h5 class="fs-5 fw-medium">Data Protection</h5>\n<p class="text-300">Implement strong security measures to protect user data. Use encryption, secure authentication methods, and regular security audits to safeguard sensitive information.</p>\n<h5 class="fs-5 fw-medium">Transparent Policies</h5>\n<p class="text-300">Be transparent about your data collection and usage policies. Provide users with clear information about how their data is used and give them control over their privacy settings.</p>\n<h5 class="fs-5 fw-medium">Regular Updates</h5>\n<p class="text-300">Keep your app updated with the latest security patches and improvements. Regular updates not only enhance security but also show users that you are actively maintaining and improving the app.</p>\n\n[highlighted-box title="Conclusion" description="Creating a seamless mobile experience requires a user-centric approach, performance optimization, responsive design, user engagement strategies, and robust security measures. By focusing on these key areas, you can build a mobile app that not only meets user expectations but also stands out in the competitive app market. Remember, a great mobile experience can turn users into loyal advocates, driving the success of your app."][/highlighted-box]\n', 'published', 1, 'Botble\\ACL\\Models\\User', 1, 'main/posts/10.png', 1622, NULL, '2025-01-16 04:36:27', '2025-09-11 19:44:28'),
	(5, 'Creating Responsive UIs with Tailwind CSS', 'Learn how to create responsive user interfaces quickly and efficiently using the utility-first CSS framework, Tailwind CSS.', '<h5>Prioritize User-Centric Design</h5>\n<h5 class="fs-5 fw-medium">Understand Your Users</h5>\n<p class="text-300">Conduct thorough user research to understand your target audience’s needs, preferences, and pain points. Use surveys, interviews, and usability testing to gather valuable insights.</p>\n<h5 class="fs-5 fw-medium">Simplify Navigation</h5>\n<p class="text-300">Design a clean and intuitive navigation structure. Ensure users can easily find what they’re looking for without feeling overwhelmed. Use familiar icons and clear labels to guide them.</p>\n<h5 class="mt-6">Optimize Performance</h5>\n<h5 class="fs-5 fw-medium">Fast Loading Times</h5>\n<p class="text-300">Optimize your app to load quickly. Users expect instant gratification, and slow load times can lead to frustration and app abandonment. Use efficient coding practices and minimize the use of heavy graphics.</p>\n<h5 class="fs-5 fw-medium">Smooth Animations</h5>\n<p class="text-300">Ensure animations and transitions are smooth and do not hinder the app’s performance. Well-executed animations can enhance the user experience by providing visual feedback and making interactions feel natural.</p>\n<h5 class="fs-5 fw-medium">Offline Access</h5>\n<p class="text-300">Provide offline capabilities for essential features. Allowing users to access certain functionalities without an internet connection can greatly improve their experience, especially in areas with poor connectivity.</p>\n<h5>Ensure Robust Security</h5>\n<h5 class="fs-5 fw-medium">Data Protection</h5>\n<p class="text-300">Implement strong security measures to protect user data. Use encryption, secure authentication methods, and regular security audits to safeguard sensitive information.</p>\n<h5 class="fs-5 fw-medium">Transparent Policies</h5>\n<p class="text-300">Be transparent about your data collection and usage policies. Provide users with clear information about how their data is used and give them control over their privacy settings.</p>\n<h5 class="fs-5 fw-medium">Regular Updates</h5>\n<p class="text-300">Keep your app updated with the latest security patches and improvements. Regular updates not only enhance security but also show users that you are actively maintaining and improving the app.</p>\n\n[highlighted-box title="Conclusion" description="Creating a seamless mobile experience requires a user-centric approach, performance optimization, responsive design, user engagement strategies, and robust security measures. By focusing on these key areas, you can build a mobile app that not only meets user expectations but also stands out in the competitive app market. Remember, a great mobile experience can turn users into loyal advocates, driving the success of your app."][/highlighted-box]\n', 'published', 1, 'Botble\\ACL\\Models\\User', 1, 'main/posts/10.png', 514, NULL, '2024-11-12 08:36:30', '2025-09-11 19:44:28'),
	(6, 'Why I Love Contributing to Open Source Projects', 'A deep dive into why open source matters to me, how it helped me grow as a developer, and why every developer should contribute to open source.', '<h5>Prioritize User-Centric Design</h5>\n<h5 class="fs-5 fw-medium">Understand Your Users</h5>\n<p class="text-300">Conduct thorough user research to understand your target audience’s needs, preferences, and pain points. Use surveys, interviews, and usability testing to gather valuable insights.</p>\n<h5 class="fs-5 fw-medium">Simplify Navigation</h5>\n<p class="text-300">Design a clean and intuitive navigation structure. Ensure users can easily find what they’re looking for without feeling overwhelmed. Use familiar icons and clear labels to guide them.</p>\n<h5 class="mt-6">Optimize Performance</h5>\n<h5 class="fs-5 fw-medium">Fast Loading Times</h5>\n<p class="text-300">Optimize your app to load quickly. Users expect instant gratification, and slow load times can lead to frustration and app abandonment. Use efficient coding practices and minimize the use of heavy graphics.</p>\n<h5 class="fs-5 fw-medium">Smooth Animations</h5>\n<p class="text-300">Ensure animations and transitions are smooth and do not hinder the app’s performance. Well-executed animations can enhance the user experience by providing visual feedback and making interactions feel natural.</p>\n<h5 class="fs-5 fw-medium">Offline Access</h5>\n<p class="text-300">Provide offline capabilities for essential features. Allowing users to access certain functionalities without an internet connection can greatly improve their experience, especially in areas with poor connectivity.</p>\n<h5>Ensure Robust Security</h5>\n<h5 class="fs-5 fw-medium">Data Protection</h5>\n<p class="text-300">Implement strong security measures to protect user data. Use encryption, secure authentication methods, and regular security audits to safeguard sensitive information.</p>\n<h5 class="fs-5 fw-medium">Transparent Policies</h5>\n<p class="text-300">Be transparent about your data collection and usage policies. Provide users with clear information about how their data is used and give them control over their privacy settings.</p>\n<h5 class="fs-5 fw-medium">Regular Updates</h5>\n<p class="text-300">Keep your app updated with the latest security patches and improvements. Regular updates not only enhance security but also show users that you are actively maintaining and improving the app.</p>\n\n[highlighted-box title="Conclusion" description="Creating a seamless mobile experience requires a user-centric approach, performance optimization, responsive design, user engagement strategies, and robust security measures. By focusing on these key areas, you can build a mobile app that not only meets user expectations but also stands out in the competitive app market. Remember, a great mobile experience can turn users into loyal advocates, driving the success of your app."][/highlighted-box]\n', 'published', 1, 'Botble\\ACL\\Models\\User', 1, 'main/posts/3.png', 111, NULL, '2025-08-27 07:05:44', '2025-09-11 19:44:28'),
	(7, 'A Deep Dive into Laravel for Beginners', 'A comprehensive guide for beginners who want to learn Laravel, covering everything from installation to building a simple application.', '<h5>Prioritize User-Centric Design</h5>\n<h5 class="fs-5 fw-medium">Understand Your Users</h5>\n<p class="text-300">Conduct thorough user research to understand your target audience’s needs, preferences, and pain points. Use surveys, interviews, and usability testing to gather valuable insights.</p>\n<h5 class="fs-5 fw-medium">Simplify Navigation</h5>\n<p class="text-300">Design a clean and intuitive navigation structure. Ensure users can easily find what they’re looking for without feeling overwhelmed. Use familiar icons and clear labels to guide them.</p>\n<h5 class="mt-6">Optimize Performance</h5>\n<h5 class="fs-5 fw-medium">Fast Loading Times</h5>\n<p class="text-300">Optimize your app to load quickly. Users expect instant gratification, and slow load times can lead to frustration and app abandonment. Use efficient coding practices and minimize the use of heavy graphics.</p>\n<h5 class="fs-5 fw-medium">Smooth Animations</h5>\n<p class="text-300">Ensure animations and transitions are smooth and do not hinder the app’s performance. Well-executed animations can enhance the user experience by providing visual feedback and making interactions feel natural.</p>\n<h5 class="fs-5 fw-medium">Offline Access</h5>\n<p class="text-300">Provide offline capabilities for essential features. Allowing users to access certain functionalities without an internet connection can greatly improve their experience, especially in areas with poor connectivity.</p>\n<h5>Ensure Robust Security</h5>\n<h5 class="fs-5 fw-medium">Data Protection</h5>\n<p class="text-300">Implement strong security measures to protect user data. Use encryption, secure authentication methods, and regular security audits to safeguard sensitive information.</p>\n<h5 class="fs-5 fw-medium">Transparent Policies</h5>\n<p class="text-300">Be transparent about your data collection and usage policies. Provide users with clear information about how their data is used and give them control over their privacy settings.</p>\n<h5 class="fs-5 fw-medium">Regular Updates</h5>\n<p class="text-300">Keep your app updated with the latest security patches and improvements. Regular updates not only enhance security but also show users that you are actively maintaining and improving the app.</p>\n\n[highlighted-box title="Conclusion" description="Creating a seamless mobile experience requires a user-centric approach, performance optimization, responsive design, user engagement strategies, and robust security measures. By focusing on these key areas, you can build a mobile app that not only meets user expectations but also stands out in the competitive app market. Remember, a great mobile experience can turn users into loyal advocates, driving the success of your app."][/highlighted-box]\n', 'published', 1, 'Botble\\ACL\\Models\\User', 0, 'main/posts/9.png', 1874, NULL, '2025-03-21 14:43:33', '2025-09-11 19:44:28'),
	(8, 'Exploring the Benefits of MySQL for Large-Scale Projects', 'An exploration of why MySQL is a great choice for large-scale projects, highlighting features, scalability, and performance tips.', '<h5>Prioritize User-Centric Design</h5>\n<h5 class="fs-5 fw-medium">Understand Your Users</h5>\n<p class="text-300">Conduct thorough user research to understand your target audience’s needs, preferences, and pain points. Use surveys, interviews, and usability testing to gather valuable insights.</p>\n<h5 class="fs-5 fw-medium">Simplify Navigation</h5>\n<p class="text-300">Design a clean and intuitive navigation structure. Ensure users can easily find what they’re looking for without feeling overwhelmed. Use familiar icons and clear labels to guide them.</p>\n<h5 class="mt-6">Optimize Performance</h5>\n<h5 class="fs-5 fw-medium">Fast Loading Times</h5>\n<p class="text-300">Optimize your app to load quickly. Users expect instant gratification, and slow load times can lead to frustration and app abandonment. Use efficient coding practices and minimize the use of heavy graphics.</p>\n<h5 class="fs-5 fw-medium">Smooth Animations</h5>\n<p class="text-300">Ensure animations and transitions are smooth and do not hinder the app’s performance. Well-executed animations can enhance the user experience by providing visual feedback and making interactions feel natural.</p>\n<h5 class="fs-5 fw-medium">Offline Access</h5>\n<p class="text-300">Provide offline capabilities for essential features. Allowing users to access certain functionalities without an internet connection can greatly improve their experience, especially in areas with poor connectivity.</p>\n<h5>Ensure Robust Security</h5>\n<h5 class="fs-5 fw-medium">Data Protection</h5>\n<p class="text-300">Implement strong security measures to protect user data. Use encryption, secure authentication methods, and regular security audits to safeguard sensitive information.</p>\n<h5 class="fs-5 fw-medium">Transparent Policies</h5>\n<p class="text-300">Be transparent about your data collection and usage policies. Provide users with clear information about how their data is used and give them control over their privacy settings.</p>\n<h5 class="fs-5 fw-medium">Regular Updates</h5>\n<p class="text-300">Keep your app updated with the latest security patches and improvements. Regular updates not only enhance security but also show users that you are actively maintaining and improving the app.</p>\n\n[highlighted-box title="Conclusion" description="Creating a seamless mobile experience requires a user-centric approach, performance optimization, responsive design, user engagement strategies, and robust security measures. By focusing on these key areas, you can build a mobile app that not only meets user expectations but also stands out in the competitive app market. Remember, a great mobile experience can turn users into loyal advocates, driving the success of your app."][/highlighted-box]\n', 'published', 1, 'Botble\\ACL\\Models\\User', 0, 'main/posts/4.png', 1403, NULL, '2024-12-23 12:22:21', '2025-09-11 19:44:28'),
	(9, 'How to Integrate APIs in Node.js for Your Next Project', 'Learn how to seamlessly integrate third-party APIs in your Node.js applications for powerful data access and functionality.', '<h5>Prioritize User-Centric Design</h5>\n<h5 class="fs-5 fw-medium">Understand Your Users</h5>\n<p class="text-300">Conduct thorough user research to understand your target audience’s needs, preferences, and pain points. Use surveys, interviews, and usability testing to gather valuable insights.</p>\n<h5 class="fs-5 fw-medium">Simplify Navigation</h5>\n<p class="text-300">Design a clean and intuitive navigation structure. Ensure users can easily find what they’re looking for without feeling overwhelmed. Use familiar icons and clear labels to guide them.</p>\n<h5 class="mt-6">Optimize Performance</h5>\n<h5 class="fs-5 fw-medium">Fast Loading Times</h5>\n<p class="text-300">Optimize your app to load quickly. Users expect instant gratification, and slow load times can lead to frustration and app abandonment. Use efficient coding practices and minimize the use of heavy graphics.</p>\n<h5 class="fs-5 fw-medium">Smooth Animations</h5>\n<p class="text-300">Ensure animations and transitions are smooth and do not hinder the app’s performance. Well-executed animations can enhance the user experience by providing visual feedback and making interactions feel natural.</p>\n<h5 class="fs-5 fw-medium">Offline Access</h5>\n<p class="text-300">Provide offline capabilities for essential features. Allowing users to access certain functionalities without an internet connection can greatly improve their experience, especially in areas with poor connectivity.</p>\n<h5>Ensure Robust Security</h5>\n<h5 class="fs-5 fw-medium">Data Protection</h5>\n<p class="text-300">Implement strong security measures to protect user data. Use encryption, secure authentication methods, and regular security audits to safeguard sensitive information.</p>\n<h5 class="fs-5 fw-medium">Transparent Policies</h5>\n<p class="text-300">Be transparent about your data collection and usage policies. Provide users with clear information about how their data is used and give them control over their privacy settings.</p>\n<h5 class="fs-5 fw-medium">Regular Updates</h5>\n<p class="text-300">Keep your app updated with the latest security patches and improvements. Regular updates not only enhance security but also show users that you are actively maintaining and improving the app.</p>\n\n[highlighted-box title="Conclusion" description="Creating a seamless mobile experience requires a user-centric approach, performance optimization, responsive design, user engagement strategies, and robust security measures. By focusing on these key areas, you can build a mobile app that not only meets user expectations but also stands out in the competitive app market. Remember, a great mobile experience can turn users into loyal advocates, driving the success of your app."][/highlighted-box]\n', 'published', 1, 'Botble\\ACL\\Models\\User', 0, 'main/posts/1.png', 2034, NULL, '2024-12-25 15:43:46', '2025-09-11 19:44:28'),
	(10, 'Best Practices for Designing User-Friendly Websites', 'Discover the best practices for designing websites that are not only aesthetically pleasing but also user-friendly and accessible.', '<h5>Prioritize User-Centric Design</h5>\n<h5 class="fs-5 fw-medium">Understand Your Users</h5>\n<p class="text-300">Conduct thorough user research to understand your target audience’s needs, preferences, and pain points. Use surveys, interviews, and usability testing to gather valuable insights.</p>\n<h5 class="fs-5 fw-medium">Simplify Navigation</h5>\n<p class="text-300">Design a clean and intuitive navigation structure. Ensure users can easily find what they’re looking for without feeling overwhelmed. Use familiar icons and clear labels to guide them.</p>\n<h5 class="mt-6">Optimize Performance</h5>\n<h5 class="fs-5 fw-medium">Fast Loading Times</h5>\n<p class="text-300">Optimize your app to load quickly. Users expect instant gratification, and slow load times can lead to frustration and app abandonment. Use efficient coding practices and minimize the use of heavy graphics.</p>\n<h5 class="fs-5 fw-medium">Smooth Animations</h5>\n<p class="text-300">Ensure animations and transitions are smooth and do not hinder the app’s performance. Well-executed animations can enhance the user experience by providing visual feedback and making interactions feel natural.</p>\n<h5 class="fs-5 fw-medium">Offline Access</h5>\n<p class="text-300">Provide offline capabilities for essential features. Allowing users to access certain functionalities without an internet connection can greatly improve their experience, especially in areas with poor connectivity.</p>\n<h5>Ensure Robust Security</h5>\n<h5 class="fs-5 fw-medium">Data Protection</h5>\n<p class="text-300">Implement strong security measures to protect user data. Use encryption, secure authentication methods, and regular security audits to safeguard sensitive information.</p>\n<h5 class="fs-5 fw-medium">Transparent Policies</h5>\n<p class="text-300">Be transparent about your data collection and usage policies. Provide users with clear information about how their data is used and give them control over their privacy settings.</p>\n<h5 class="fs-5 fw-medium">Regular Updates</h5>\n<p class="text-300">Keep your app updated with the latest security patches and improvements. Regular updates not only enhance security but also show users that you are actively maintaining and improving the app.</p>\n\n[highlighted-box title="Conclusion" description="Creating a seamless mobile experience requires a user-centric approach, performance optimization, responsive design, user engagement strategies, and robust security measures. By focusing on these key areas, you can build a mobile app that not only meets user expectations but also stands out in the competitive app market. Remember, a great mobile experience can turn users into loyal advocates, driving the success of your app."][/highlighted-box]\n', 'published', 1, 'Botble\\ACL\\Models\\User', 0, 'main/posts/3.png', 1943, NULL, '2025-02-02 06:52:25', '2025-09-11 19:44:28'),
	(11, 'Lessons from My First Web Development Job', 'Reflecting on my first web development job, the lessons I learned, the challenges I faced, and how it shaped my career.', '<h5>Prioritize User-Centric Design</h5>\n<h5 class="fs-5 fw-medium">Understand Your Users</h5>\n<p class="text-300">Conduct thorough user research to understand your target audience’s needs, preferences, and pain points. Use surveys, interviews, and usability testing to gather valuable insights.</p>\n<h5 class="fs-5 fw-medium">Simplify Navigation</h5>\n<p class="text-300">Design a clean and intuitive navigation structure. Ensure users can easily find what they’re looking for without feeling overwhelmed. Use familiar icons and clear labels to guide them.</p>\n<h5 class="mt-6">Optimize Performance</h5>\n<h5 class="fs-5 fw-medium">Fast Loading Times</h5>\n<p class="text-300">Optimize your app to load quickly. Users expect instant gratification, and slow load times can lead to frustration and app abandonment. Use efficient coding practices and minimize the use of heavy graphics.</p>\n<h5 class="fs-5 fw-medium">Smooth Animations</h5>\n<p class="text-300">Ensure animations and transitions are smooth and do not hinder the app’s performance. Well-executed animations can enhance the user experience by providing visual feedback and making interactions feel natural.</p>\n<h5 class="fs-5 fw-medium">Offline Access</h5>\n<p class="text-300">Provide offline capabilities for essential features. Allowing users to access certain functionalities without an internet connection can greatly improve their experience, especially in areas with poor connectivity.</p>\n<h5>Ensure Robust Security</h5>\n<h5 class="fs-5 fw-medium">Data Protection</h5>\n<p class="text-300">Implement strong security measures to protect user data. Use encryption, secure authentication methods, and regular security audits to safeguard sensitive information.</p>\n<h5 class="fs-5 fw-medium">Transparent Policies</h5>\n<p class="text-300">Be transparent about your data collection and usage policies. Provide users with clear information about how their data is used and give them control over their privacy settings.</p>\n<h5 class="fs-5 fw-medium">Regular Updates</h5>\n<p class="text-300">Keep your app updated with the latest security patches and improvements. Regular updates not only enhance security but also show users that you are actively maintaining and improving the app.</p>\n\n[highlighted-box title="Conclusion" description="Creating a seamless mobile experience requires a user-centric approach, performance optimization, responsive design, user engagement strategies, and robust security measures. By focusing on these key areas, you can build a mobile app that not only meets user expectations but also stands out in the competitive app market. Remember, a great mobile experience can turn users into loyal advocates, driving the success of your app."][/highlighted-box]\n', 'published', 1, 'Botble\\ACL\\Models\\User', 1, 'main/posts/4.png', 1086, NULL, '2025-01-21 09:12:16', '2025-09-11 19:44:28'),
	(12, 'How to Contribute to Open Source: A Beginner’s Guide', 'A step-by-step guide on how beginners can start contributing to open source projects, with tips on finding the right project and making meaningful contributions.', '<h5>Prioritize User-Centric Design</h5>\n<h5 class="fs-5 fw-medium">Understand Your Users</h5>\n<p class="text-300">Conduct thorough user research to understand your target audience’s needs, preferences, and pain points. Use surveys, interviews, and usability testing to gather valuable insights.</p>\n<h5 class="fs-5 fw-medium">Simplify Navigation</h5>\n<p class="text-300">Design a clean and intuitive navigation structure. Ensure users can easily find what they’re looking for without feeling overwhelmed. Use familiar icons and clear labels to guide them.</p>\n<h5 class="mt-6">Optimize Performance</h5>\n<h5 class="fs-5 fw-medium">Fast Loading Times</h5>\n<p class="text-300">Optimize your app to load quickly. Users expect instant gratification, and slow load times can lead to frustration and app abandonment. Use efficient coding practices and minimize the use of heavy graphics.</p>\n<h5 class="fs-5 fw-medium">Smooth Animations</h5>\n<p class="text-300">Ensure animations and transitions are smooth and do not hinder the app’s performance. Well-executed animations can enhance the user experience by providing visual feedback and making interactions feel natural.</p>\n<h5 class="fs-5 fw-medium">Offline Access</h5>\n<p class="text-300">Provide offline capabilities for essential features. Allowing users to access certain functionalities without an internet connection can greatly improve their experience, especially in areas with poor connectivity.</p>\n<h5>Ensure Robust Security</h5>\n<h5 class="fs-5 fw-medium">Data Protection</h5>\n<p class="text-300">Implement strong security measures to protect user data. Use encryption, secure authentication methods, and regular security audits to safeguard sensitive information.</p>\n<h5 class="fs-5 fw-medium">Transparent Policies</h5>\n<p class="text-300">Be transparent about your data collection and usage policies. Provide users with clear information about how their data is used and give them control over their privacy settings.</p>\n<h5 class="fs-5 fw-medium">Regular Updates</h5>\n<p class="text-300">Keep your app updated with the latest security patches and improvements. Regular updates not only enhance security but also show users that you are actively maintaining and improving the app.</p>\n\n[highlighted-box title="Conclusion" description="Creating a seamless mobile experience requires a user-centric approach, performance optimization, responsive design, user engagement strategies, and robust security measures. By focusing on these key areas, you can build a mobile app that not only meets user expectations but also stands out in the competitive app market. Remember, a great mobile experience can turn users into loyal advocates, driving the success of your app."][/highlighted-box]\n', 'published', 1, 'Botble\\ACL\\Models\\User', 0, 'main/posts/3.png', 2477, NULL, '2024-11-09 11:20:20', '2025-09-11 19:44:28'),
	(13, 'Optimizing Web Performance with React.js', 'Learn how to optimize your React.js applications for better performance, focusing on code splitting, lazy loading, and efficient state management.', '<h5>Prioritize User-Centric Design</h5>\n<h5 class="fs-5 fw-medium">Understand Your Users</h5>\n<p class="text-300">Conduct thorough user research to understand your target audience’s needs, preferences, and pain points. Use surveys, interviews, and usability testing to gather valuable insights.</p>\n<h5 class="fs-5 fw-medium">Simplify Navigation</h5>\n<p class="text-300">Design a clean and intuitive navigation structure. Ensure users can easily find what they’re looking for without feeling overwhelmed. Use familiar icons and clear labels to guide them.</p>\n<h5 class="mt-6">Optimize Performance</h5>\n<h5 class="fs-5 fw-medium">Fast Loading Times</h5>\n<p class="text-300">Optimize your app to load quickly. Users expect instant gratification, and slow load times can lead to frustration and app abandonment. Use efficient coding practices and minimize the use of heavy graphics.</p>\n<h5 class="fs-5 fw-medium">Smooth Animations</h5>\n<p class="text-300">Ensure animations and transitions are smooth and do not hinder the app’s performance. Well-executed animations can enhance the user experience by providing visual feedback and making interactions feel natural.</p>\n<h5 class="fs-5 fw-medium">Offline Access</h5>\n<p class="text-300">Provide offline capabilities for essential features. Allowing users to access certain functionalities without an internet connection can greatly improve their experience, especially in areas with poor connectivity.</p>\n<h5>Ensure Robust Security</h5>\n<h5 class="fs-5 fw-medium">Data Protection</h5>\n<p class="text-300">Implement strong security measures to protect user data. Use encryption, secure authentication methods, and regular security audits to safeguard sensitive information.</p>\n<h5 class="fs-5 fw-medium">Transparent Policies</h5>\n<p class="text-300">Be transparent about your data collection and usage policies. Provide users with clear information about how their data is used and give them control over their privacy settings.</p>\n<h5 class="fs-5 fw-medium">Regular Updates</h5>\n<p class="text-300">Keep your app updated with the latest security patches and improvements. Regular updates not only enhance security but also show users that you are actively maintaining and improving the app.</p>\n\n[highlighted-box title="Conclusion" description="Creating a seamless mobile experience requires a user-centric approach, performance optimization, responsive design, user engagement strategies, and robust security measures. By focusing on these key areas, you can build a mobile app that not only meets user expectations but also stands out in the competitive app market. Remember, a great mobile experience can turn users into loyal advocates, driving the success of your app."][/highlighted-box]\n', 'published', 1, 'Botble\\ACL\\Models\\User', 0, 'main/posts/4.png', 1091, NULL, '2025-08-18 14:49:02', '2025-09-11 19:44:28'),
	(14, 'My Top 5 GitHub Projects', 'An overview of my top 5 GitHub projects, showcasing what I’ve built and how they’ve helped me grow as a developer.', '<h5>Prioritize User-Centric Design</h5>\n<h5 class="fs-5 fw-medium">Understand Your Users</h5>\n<p class="text-300">Conduct thorough user research to understand your target audience’s needs, preferences, and pain points. Use surveys, interviews, and usability testing to gather valuable insights.</p>\n<h5 class="fs-5 fw-medium">Simplify Navigation</h5>\n<p class="text-300">Design a clean and intuitive navigation structure. Ensure users can easily find what they’re looking for without feeling overwhelmed. Use familiar icons and clear labels to guide them.</p>\n<h5 class="mt-6">Optimize Performance</h5>\n<h5 class="fs-5 fw-medium">Fast Loading Times</h5>\n<p class="text-300">Optimize your app to load quickly. Users expect instant gratification, and slow load times can lead to frustration and app abandonment. Use efficient coding practices and minimize the use of heavy graphics.</p>\n<h5 class="fs-5 fw-medium">Smooth Animations</h5>\n<p class="text-300">Ensure animations and transitions are smooth and do not hinder the app’s performance. Well-executed animations can enhance the user experience by providing visual feedback and making interactions feel natural.</p>\n<h5 class="fs-5 fw-medium">Offline Access</h5>\n<p class="text-300">Provide offline capabilities for essential features. Allowing users to access certain functionalities without an internet connection can greatly improve their experience, especially in areas with poor connectivity.</p>\n<h5>Ensure Robust Security</h5>\n<h5 class="fs-5 fw-medium">Data Protection</h5>\n<p class="text-300">Implement strong security measures to protect user data. Use encryption, secure authentication methods, and regular security audits to safeguard sensitive information.</p>\n<h5 class="fs-5 fw-medium">Transparent Policies</h5>\n<p class="text-300">Be transparent about your data collection and usage policies. Provide users with clear information about how their data is used and give them control over their privacy settings.</p>\n<h5 class="fs-5 fw-medium">Regular Updates</h5>\n<p class="text-300">Keep your app updated with the latest security patches and improvements. Regular updates not only enhance security but also show users that you are actively maintaining and improving the app.</p>\n\n[highlighted-box title="Conclusion" description="Creating a seamless mobile experience requires a user-centric approach, performance optimization, responsive design, user engagement strategies, and robust security measures. By focusing on these key areas, you can build a mobile app that not only meets user expectations but also stands out in the competitive app market. Remember, a great mobile experience can turn users into loyal advocates, driving the success of your app."][/highlighted-box]\n', 'published', 1, 'Botble\\ACL\\Models\\User', 0, 'main/posts/8.png', 518, NULL, '2024-11-04 23:55:47', '2025-09-11 19:44:28'),
	(15, 'Adapting to the New Web Development Trends in 2024', 'A look at the latest trends in web development for 2024, including new technologies, best practices, and what the future holds for developers.', '<h5>Prioritize User-Centric Design</h5>\n<h5 class="fs-5 fw-medium">Understand Your Users</h5>\n<p class="text-300">Conduct thorough user research to understand your target audience’s needs, preferences, and pain points. Use surveys, interviews, and usability testing to gather valuable insights.</p>\n<h5 class="fs-5 fw-medium">Simplify Navigation</h5>\n<p class="text-300">Design a clean and intuitive navigation structure. Ensure users can easily find what they’re looking for without feeling overwhelmed. Use familiar icons and clear labels to guide them.</p>\n<h5 class="mt-6">Optimize Performance</h5>\n<h5 class="fs-5 fw-medium">Fast Loading Times</h5>\n<p class="text-300">Optimize your app to load quickly. Users expect instant gratification, and slow load times can lead to frustration and app abandonment. Use efficient coding practices and minimize the use of heavy graphics.</p>\n<h5 class="fs-5 fw-medium">Smooth Animations</h5>\n<p class="text-300">Ensure animations and transitions are smooth and do not hinder the app’s performance. Well-executed animations can enhance the user experience by providing visual feedback and making interactions feel natural.</p>\n<h5 class="fs-5 fw-medium">Offline Access</h5>\n<p class="text-300">Provide offline capabilities for essential features. Allowing users to access certain functionalities without an internet connection can greatly improve their experience, especially in areas with poor connectivity.</p>\n<h5>Ensure Robust Security</h5>\n<h5 class="fs-5 fw-medium">Data Protection</h5>\n<p class="text-300">Implement strong security measures to protect user data. Use encryption, secure authentication methods, and regular security audits to safeguard sensitive information.</p>\n<h5 class="fs-5 fw-medium">Transparent Policies</h5>\n<p class="text-300">Be transparent about your data collection and usage policies. Provide users with clear information about how their data is used and give them control over their privacy settings.</p>\n<h5 class="fs-5 fw-medium">Regular Updates</h5>\n<p class="text-300">Keep your app updated with the latest security patches and improvements. Regular updates not only enhance security but also show users that you are actively maintaining and improving the app.</p>\n\n[highlighted-box title="Conclusion" description="Creating a seamless mobile experience requires a user-centric approach, performance optimization, responsive design, user engagement strategies, and robust security measures. By focusing on these key areas, you can build a mobile app that not only meets user expectations but also stands out in the competitive app market. Remember, a great mobile experience can turn users into loyal advocates, driving the success of your app."][/highlighted-box]\n', 'published', 1, 'Botble\\ACL\\Models\\User', 1, 'main/posts/11.png', 1651, NULL, '2025-05-24 05:58:02', '2025-09-11 19:44:28');

-- membuang struktur untuk table ucuy.posts_translations
CREATE TABLE IF NOT EXISTS `posts_translations` (
  `lang_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `posts_id` bigint unsigned NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`lang_code`,`posts_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.posts_translations: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.push_notification_recipients
CREATE TABLE IF NOT EXISTS `push_notification_recipients` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `push_notification_id` bigint unsigned NOT NULL,
  `user_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `device_token` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `platform` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'sent',
  `sent_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `clicked_at` timestamp NULL DEFAULT NULL,
  `fcm_response` json DEFAULT NULL,
  `error_message` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pnr_notification_user_index` (`push_notification_id`,`user_type`,`user_id`),
  KEY `pnr_user_status_index` (`user_type`,`user_id`,`status`),
  KEY `pnr_user_read_index` (`user_type`,`user_id`,`read_at`),
  KEY `pnr_status_index` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.push_notification_recipients: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.push_notifications
CREATE TABLE IF NOT EXISTS `push_notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `target_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target_value` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action_url` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `data` json DEFAULT NULL,
  `status` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'sent',
  `sent_count` int NOT NULL DEFAULT '0',
  `failed_count` int NOT NULL DEFAULT '0',
  `delivered_count` int NOT NULL DEFAULT '0',
  `read_count` int NOT NULL DEFAULT '0',
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `push_notifications_type_created_at_index` (`type`,`created_at`),
  KEY `push_notifications_status_scheduled_at_index` (`status`,`scheduled_at`),
  KEY `push_notifications_created_by_index` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.push_notifications: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.request_logs
CREATE TABLE IF NOT EXISTS `request_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `status_code` int DEFAULT NULL,
  `url` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `count` int unsigned NOT NULL DEFAULT '0',
  `user_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referrer` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.request_logs: ~1 rows (lebih kurang)
INSERT INTO `request_logs` (`id`, `status_code`, `url`, `count`, `user_id`, `referrer`, `created_at`, `updated_at`) VALUES
	(1, 404, 'https://yusufefendi.com/sm/fb3ed351cd5c0f1f30f88778ee1f9b056598e6d25ac4fdcab1eebcd8be521cd9.map', 2, NULL, NULL, '2025-12-09 11:10:15', '2025-12-09 11:14:17'),
	(2, 404, 'http://localhost:8000/dashboard', 1, NULL, NULL, '2025-12-09 11:16:51', '2025-12-09 11:16:51');

-- membuang struktur untuk table ucuy.revisions
CREATE TABLE IF NOT EXISTS `revisions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `revisionable_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `revisionable_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `key` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `new_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `revisions_revisionable_id_revisionable_type_index` (`revisionable_id`,`revisionable_type`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.revisions: ~3 rows (lebih kurang)
INSERT INTO `revisions` (`id`, `revisionable_type`, `revisionable_id`, `user_id`, `key`, `old_value`, `new_value`, `created_at`, `updated_at`) VALUES
	(1, 'Botble\\Page\\Models\\Page', 1, 1, 'image', NULL, 'photo-2025-09-26-19-07-38.jpg', '2025-11-26 08:24:36', '2025-11-26 08:24:36'),
	(2, 'Botble\\Page\\Models\\Page', 1, 1, 'template', NULL, 'default', '2025-11-26 08:24:36', '2025-11-26 08:24:36'),
	(3, 'Botble\\Page\\Models\\Page', 1, 1, 'description', NULL, '', '2025-11-26 08:24:36', '2025-11-26 08:24:36'),
	(4, 'Botble\\Page\\Models\\Page', 1, 1, 'image', 'photo-2025-09-26-19-07-38.jpg', NULL, '2025-11-26 08:25:00', '2025-11-26 08:25:00');

-- membuang struktur untuk table ucuy.role_users
CREATE TABLE IF NOT EXISTS `role_users` (
  `user_id` bigint unsigned NOT NULL,
  `role_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `role_users_user_id_index` (`user_id`),
  KEY `role_users_role_id_index` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.role_users: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `permissions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `description` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_default` tinyint unsigned NOT NULL DEFAULT '0',
  `created_by` bigint unsigned NOT NULL,
  `updated_by` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_slug_unique` (`slug`),
  KEY `roles_created_by_index` (`created_by`),
  KEY `roles_updated_by_index` (`updated_by`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.roles: ~0 rows (lebih kurang)
INSERT INTO `roles` (`id`, `slug`, `name`, `permissions`, `description`, `is_default`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
	(1, 'admin', 'Admin', '{"users.index":true,"users.create":true,"users.edit":true,"users.destroy":true,"roles.index":true,"roles.create":true,"roles.edit":true,"roles.destroy":true,"core.system":true,"core.cms":true,"core.manage.license":true,"systems.cronjob":true,"core.tools":true,"tools.data-synchronize":true,"media.index":true,"files.index":true,"files.create":true,"files.edit":true,"files.trash":true,"files.destroy":true,"folders.index":true,"folders.create":true,"folders.edit":true,"folders.trash":true,"folders.destroy":true,"settings.index":true,"settings.common":true,"settings.options":true,"settings.email":true,"settings.media":true,"settings.admin-appearance":true,"settings.cache":true,"settings.datatables":true,"settings.email.rules":true,"settings.others":true,"menus.index":true,"menus.create":true,"menus.edit":true,"menus.destroy":true,"optimize.settings":true,"pages.index":true,"pages.create":true,"pages.edit":true,"pages.destroy":true,"plugins.index":true,"plugins.edit":true,"plugins.remove":true,"plugins.marketplace":true,"sitemap.settings":true,"core.appearance":true,"theme.index":true,"theme.activate":true,"theme.remove":true,"theme.options":true,"theme.custom-css":true,"theme.custom-js":true,"theme.custom-html":true,"theme.robots-txt":true,"settings.website-tracking":true,"widgets.index":true,"analytics.general":true,"analytics.page":true,"analytics.browser":true,"analytics.referrer":true,"analytics.settings":true,"announcements.index":true,"announcements.create":true,"announcements.edit":true,"announcements.destroy":true,"announcements.settings":true,"audit-log.index":true,"audit-log.destroy":true,"backups.index":true,"backups.create":true,"backups.restore":true,"backups.destroy":true,"plugins.blog":true,"posts.index":true,"posts.create":true,"posts.edit":true,"posts.destroy":true,"categories.index":true,"categories.create":true,"categories.edit":true,"categories.destroy":true,"tags.index":true,"tags.create":true,"tags.edit":true,"tags.destroy":true,"blog.settings":true,"posts.export":true,"posts.import":true,"captcha.settings":true,"contacts.index":true,"contacts.edit":true,"contacts.destroy":true,"contact.custom-fields":true,"contact.settings":true,"plugin.faq":true,"faq.index":true,"faq.create":true,"faq.edit":true,"faq.destroy":true,"faq_category.index":true,"faq_category.create":true,"faq_category.edit":true,"faq_category.destroy":true,"faqs.settings":true,"fob-comment.index":true,"fob-comment.comments.index":true,"fob-comment.comments.edit":true,"fob-comment.comments.destroy":true,"fob-comment.comments.reply":true,"fob-comment.settings":true,"galleries.index":true,"galleries.create":true,"galleries.edit":true,"galleries.destroy":true,"languages.index":true,"languages.create":true,"languages.edit":true,"languages.destroy":true,"translations.import":true,"translations.export":true,"property-translations.import":true,"property-translations.export":true,"newsletter.index":true,"newsletter.destroy":true,"newsletter.settings":true,"plugins.portfolio":true,"portfolio.projects.index":true,"portfolio.projects.create":true,"portfolio.projects.edit":true,"portfolio.projects.destroy":true,"portfolio.service-categories.index":true,"portfolio.service-categories.create":true,"portfolio.service-categories.edit":true,"portfolio.service-categories.destroy":true,"portfolio.services.index":true,"portfolio.services.create":true,"portfolio.services.edit":true,"portfolio.services.destroy":true,"portfolio.packages.index":true,"portfolio.packages.create":true,"portfolio.packages.edit":true,"portfolio.packages.destroy":true,"portfolio.quotation-requests.index":true,"portfolio.quotation-requests.create":true,"portfolio.quotation-requests.edit":true,"portfolio.quotation-requests.destroy":true,"portfolio.custom-fields.index":true,"portfolio.custom-fields.create":true,"portfolio.custom-fields.edit":true,"portfolio.custom-fields.destroy":true,"request-log.index":true,"request-log.destroy":true,"testimonial.index":true,"testimonial.create":true,"testimonial.edit":true,"testimonial.destroy":true,"plugins.translation":true,"translations.locales":true,"translations.theme-translations":true,"translations.index":true,"theme-translations.export":true,"other-translations.export":true,"theme-translations.import":true,"other-translations.import":true,"api.settings":true,"api.sanctum-token.index":true,"api.sanctum-token.create":true,"api.sanctum-token.destroy":true}', 'Admin users role', 1, 1, 1, '2025-09-11 19:44:24', '2025-09-11 19:44:24');

-- membuang struktur untuk table ucuy.sessions
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.sessions: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.settings
CREATE TABLE IF NOT EXISTS `settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_unique` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.settings: ~47 rows (lebih kurang)
INSERT INTO `settings` (`id`, `key`, `value`, `created_at`, `updated_at`) VALUES
	(1, 'media_random_hash', '3f5cea9c54583fb7bacde9c5f5adaf7e', NULL, '2025-12-30 03:08:39'),
	(2, 'api_enabled', '0', NULL, '2025-12-30 03:08:39'),
	(3, 'activated_plugins', '["language","language-advanced","analytics","announcement","audit-log","backup","blog","captcha","contact","cookie-consent","faq","fob-comment","gallery","newsletter","portfolio","request-log","rss-feed","testimonial","translation"]', NULL, '2025-12-30 03:08:39'),
	(4, 'theme', 'zelio', NULL, '2025-12-30 03:08:39'),
	(5, 'show_admin_bar', '1', NULL, '2025-12-30 03:08:39'),
	(6, 'language_hide_default', '1', NULL, '2025-12-30 03:08:39'),
	(7, 'language_switcher_display', 'dropdown', NULL, '2025-12-30 03:08:39'),
	(8, 'language_display', 'all', NULL, '2025-12-30 03:08:39'),
	(9, 'language_hide_languages', '[]', NULL, '2025-12-30 03:08:39'),
	(10, 'theme-zelio-favicon', 'favicon-01.png', NULL, '2025-12-30 03:08:39'),
	(11, 'theme-zelio-logo', 'logo-dark-styled.png', NULL, '2025-12-30 03:08:39'),
	(12, 'theme-zelio-logo_dark', 'code/general/favicon.png', NULL, '2025-12-30 03:08:39'),
	(13, 'theme-zelio-site_title', 'Yusuf Efendi Resume', NULL, '2025-12-30 03:08:39'),
	(14, 'theme-zelio-site_name', 'Yusuf Efendi', NULL, '2025-12-30 03:08:39'),
	(15, 'theme-zelio-seo_description', 'Discover innovative designs, creative projects, and unique artistic works. Showcasing the expertise and vision behind every creation.', NULL, '2025-12-30 03:08:39'),
	(16, 'theme-zelio-tp_primary_font', 'DM Mono', NULL, '2025-12-30 03:08:39'),
	(17, 'theme-zelio-primary_color', '#62a92b', NULL, '2025-12-30 03:08:39'),
	(18, 'theme-zelio-gradient_color', '#659932', NULL, '2025-12-30 03:08:39'),
	(19, 'theme-zelio-homepage_id', '1', NULL, '2025-12-30 03:08:39'),
	(20, 'theme-zelio-social_links', '[[{"key":"name","value":"Facebook"},{"key":"icon","value":"ti ti-brand-facebook"},{"key":"url","value":"https:\\/\\/www.facebook.com\\/karyapemudakampung"},{"key":"image","value":null},{"key":"color","value":"transparent"},{"key":"background-color","value":"transparent"}],[{"key":"name","value":"X (Twitter)"},{"key":"icon","value":"ti ti-brand-x"},{"key":"url","value":"https:\\/\\/x.com\\/ucuy012"},{"key":"image","value":null},{"key":"color","value":"transparent"},{"key":"background-color","value":"transparent"}],[{"key":"name","value":"YouTube"},{"key":"icon","value":"ti ti-brand-youtube"},{"key":"url","value":"https:\\/\\/www.youtube.com\\/@DigitalCreativeSolution5"},{"key":"image","value":null},{"key":"color","value":"transparent"},{"key":"background-color","value":"transparent"}],[{"key":"name","value":"Instagram"},{"key":"icon","value":"ti ti-brand-instagram"},{"key":"url","value":"https:\\/\\/www.instagram.com\\/ucuyhahahaha\\/"},{"key":"image","value":null},{"key":"color","value":"transparent"},{"key":"background-color","value":"transparent"}]]', NULL, '2025-12-30 03:08:39'),
	(21, 'theme-zelio-copyright', '© %Y All Rights Reserved by <a href="https://botble.com" class="text-primary">botble.com</a>.', NULL, '2025-12-30 03:08:39'),
	(22, 'theme-zelio-preloader_enabled', 'yes', NULL, '2025-12-30 03:08:39'),
	(23, 'theme-zelio-preloader_version', 'v2', NULL, '2025-12-30 03:08:39'),
	(24, 'theme-zelio-footer_background', 'code/general/footer-bg.png', NULL, '2025-12-30 03:08:39'),
	(25, 'theme-zelio-header_style', '2', NULL, '2025-12-30 03:08:39'),
	(26, 'theme-zelio-footer_style', '2', NULL, '2025-12-30 03:08:39'),
	(27, 'theme-zelio-preloader_style', '2', NULL, '2025-12-30 03:08:39'),
	(28, 'theme-zelio-blog_page_id', '5', NULL, '2025-12-30 03:08:39'),
	(29, 'theme-zelio-post_item_style', '2', NULL, '2025-12-30 03:08:39'),
	(30, 'theme-zelio-post_item_per_row', '3', NULL, '2025-12-30 03:08:39'),
	(31, 'theme-zelio-cookie_consent_learn_more_url', '/cookie-policy', NULL, '2025-12-30 03:08:39'),
	(32, 'theme-zelio-cookie_consent_learn_more_text', 'Cookie Policy', NULL, '2025-12-30 03:08:39'),
	(33, 'licensed_to', 'awdawd', NULL, '2025-12-30 03:08:39'),
	(34, 'theme-zelio-admin_logo', 'logo-dark-styled.png', NULL, '2025-12-30 03:08:39'),
	(35, 'admin_logo', 'logo-dark-styled.png', NULL, '2025-12-30 03:08:39'),
	(36, 'theme-zelio-admin_favicon', 'favicon-01.png', NULL, '2025-12-30 03:08:39'),
	(37, 'admin_favicon', 'favicon-01.png', NULL, '2025-12-30 03:08:39'),
	(38, 'is_completed_get_started', '1', NULL, '2025-12-30 03:08:39'),
	(39, 'theme-zelio-favicon_type', 'image/x-icon', NULL, '2025-12-30 03:08:39'),
	(40, 'admin_email', '["mahalbangetid@gmail.com"]', NULL, NULL),
	(41, 'time_zone', 'Asia/Jakarta', NULL, NULL),
	(42, 'locale_direction', 'ltr', NULL, NULL),
	(43, 'enable_send_error_reporting_via_email', '0', NULL, NULL),
	(44, 'redirect_404_to_homepage', '0', NULL, NULL),
	(45, 'request_log_data_retention_period', '30', NULL, NULL),
	(46, 'audit_log_data_retention_period', '30', NULL, NULL),
	(47, 'locale', 'en', NULL, NULL);

-- membuang struktur untuk table ucuy.slugs
CREATE TABLE IF NOT EXISTS `slugs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_id` bigint unsigned NOT NULL,
  `reference_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `prefix` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `slugs_reference_id_index` (`reference_id`),
  KEY `slugs_key_index` (`key`),
  KEY `slugs_prefix_index` (`prefix`),
  KEY `slugs_reference_index` (`reference_id`,`reference_type`),
  KEY `idx_slugs_reference` (`reference_type`,`reference_id`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.slugs: ~57 rows (lebih kurang)
INSERT INTO `slugs` (`id`, `key`, `reference_id`, `reference_type`, `prefix`, `created_at`, `updated_at`) VALUES
	(1, 'web-development', 1, 'Botble\\Blog\\Models\\Category', '', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(2, 'open-source-contributions', 2, 'Botble\\Blog\\Models\\Category', '', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(3, 'tutorials', 3, 'Botble\\Blog\\Models\\Category', '', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(4, 'technology-reviews', 4, 'Botble\\Blog\\Models\\Category', '', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(5, 'personal-blog', 5, 'Botble\\Blog\\Models\\Category', '', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(6, 'career-journey', 6, 'Botble\\Blog\\Models\\Category', '', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(7, 'coding-challenges', 7, 'Botble\\Blog\\Models\\Category', '', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(8, 'design-portfolio', 8, 'Botble\\Blog\\Models\\Category', '', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(9, 'collaborations', 9, 'Botble\\Blog\\Models\\Category', '', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(10, 'botble-cms', 1, 'Botble\\Blog\\Models\\Tag', 'tag', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(11, 'javascript', 2, 'Botble\\Blog\\Models\\Tag', 'tag', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(12, 'open-source', 3, 'Botble\\Blog\\Models\\Tag', 'tag', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(13, 'web-design', 4, 'Botble\\Blog\\Models\\Tag', 'tag', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(14, 'api-development', 5, 'Botble\\Blog\\Models\\Tag', 'tag', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(15, 'full-stack-development', 6, 'Botble\\Blog\\Models\\Tag', 'tag', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(16, 'vietnam-developer', 7, 'Botble\\Blog\\Models\\Tag', 'tag', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(17, 'github-projects', 8, 'Botble\\Blog\\Models\\Tag', 'tag', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(18, 'building-a-full-stack-app-with-the-tall-stack', 1, 'Botble\\Blog\\Models\\Post', '', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(19, 'my-journey-in-open-source-3-years-of-contributions', 2, 'Botble\\Blog\\Models\\Post', '', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(20, '5-essential-tools-for-web-developers-in-2024', 3, 'Botble\\Blog\\Models\\Post', '', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(21, 'how-i-built-my-personal-portfolio-using-botble-cms', 4, 'Botble\\Blog\\Models\\Post', '', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(22, 'creating-responsive-uis-with-tailwind-css', 5, 'Botble\\Blog\\Models\\Post', '', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(23, 'why-i-love-contributing-to-open-source-projects', 6, 'Botble\\Blog\\Models\\Post', '', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(24, 'a-deep-dive-into-laravel-for-beginners', 7, 'Botble\\Blog\\Models\\Post', '', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(25, 'exploring-the-benefits-of-mysql-for-large-scale-projects', 8, 'Botble\\Blog\\Models\\Post', '', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(26, 'how-to-integrate-apis-in-nodejs-for-your-next-project', 9, 'Botble\\Blog\\Models\\Post', '', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(27, 'best-practices-for-designing-user-friendly-websites', 10, 'Botble\\Blog\\Models\\Post', '', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(28, 'lessons-from-my-first-web-development-job', 11, 'Botble\\Blog\\Models\\Post', '', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(29, 'how-to-contribute-to-open-source-a-beginners-guide', 12, 'Botble\\Blog\\Models\\Post', '', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(30, 'optimizing-web-performance-with-reactjs', 13, 'Botble\\Blog\\Models\\Post', '', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(31, 'my-top-5-github-projects', 14, 'Botble\\Blog\\Models\\Post', '', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(32, 'adapting-to-the-new-web-development-trends-in-2024', 15, 'Botble\\Blog\\Models\\Post', '', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(33, 'api-development', 1, 'Botble\\Portfolio\\Models\\Service', 'services', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(34, 'frontend-development', 2, 'Botble\\Portfolio\\Models\\Service', 'services', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(35, 'mobile-app-development', 3, 'Botble\\Portfolio\\Models\\Service', 'services', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(36, 'devops-consulting', 4, 'Botble\\Portfolio\\Models\\Service', 'services', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(37, 'cloud-integration', 5, 'Botble\\Portfolio\\Models\\Service', 'services', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(38, 'database-management', 6, 'Botble\\Portfolio\\Models\\Service', 'services', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(39, 'crm-system', 1, 'Botble\\Portfolio\\Models\\Project', 'projects', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(40, 'e-learning-platform', 2, 'Botble\\Portfolio\\Models\\Project', 'projects', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(41, 'mobile-banking-app', 3, 'Botble\\Portfolio\\Models\\Project', 'projects', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(42, 'cloud-infrastructure-setup', 4, 'Botble\\Portfolio\\Models\\Project', 'projects', '2025-09-11 19:44:30', '2025-09-11 19:44:30'),
	(43, 'home', 1, 'Botble\\Page\\Models\\Page', '', '2025-09-11 19:44:36', '2025-09-11 19:44:36'),
	(44, 'services', 2, 'Botble\\Page\\Models\\Page', '', '2025-09-11 19:44:36', '2025-09-11 19:44:36'),
	(45, 'projects', 3, 'Botble\\Page\\Models\\Page', '', '2025-09-11 19:44:36', '2025-09-11 19:44:36'),
	(46, 'pricing', 4, 'Botble\\Page\\Models\\Page', '', '2025-09-11 19:44:36', '2025-09-11 19:44:36'),
	(47, 'blog', 5, 'Botble\\Page\\Models\\Page', '', '2025-09-11 19:44:36', '2025-09-11 19:44:36'),
	(48, 'contact', 6, 'Botble\\Page\\Models\\Page', '', '2025-09-11 19:44:36', '2025-09-11 19:44:36'),
	(49, 'cookie-policy', 7, 'Botble\\Page\\Models\\Page', '', '2025-09-11 19:44:36', '2025-09-11 19:44:36'),
	(50, 'perfect', 1, 'Botble\\Gallery\\Models\\Gallery', 'galleries', '2025-09-11 19:44:40', '2025-09-11 19:44:40'),
	(51, 'new-day', 2, 'Botble\\Gallery\\Models\\Gallery', 'galleries', '2025-09-11 19:44:40', '2025-09-11 19:44:40'),
	(52, 'happy-day', 3, 'Botble\\Gallery\\Models\\Gallery', 'galleries', '2025-09-11 19:44:40', '2025-09-11 19:44:40'),
	(53, 'nature', 4, 'Botble\\Gallery\\Models\\Gallery', 'galleries', '2025-09-11 19:44:41', '2025-09-11 19:44:41'),
	(54, 'morning', 5, 'Botble\\Gallery\\Models\\Gallery', 'galleries', '2025-09-11 19:44:41', '2025-09-11 19:44:41'),
	(55, 'sunset', 6, 'Botble\\Gallery\\Models\\Gallery', 'galleries', '2025-09-11 19:44:41', '2025-09-11 19:44:41'),
	(56, 'ocean-views', 7, 'Botble\\Gallery\\Models\\Gallery', 'galleries', '2025-09-11 19:44:41', '2025-09-11 19:44:41'),
	(57, 'adventure-time', 8, 'Botble\\Gallery\\Models\\Gallery', 'galleries', '2025-09-11 19:44:41', '2025-09-11 19:44:41');

-- membuang struktur untuk table ucuy.slugs_translations
CREATE TABLE IF NOT EXISTS `slugs_translations` (
  `lang_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slugs_id` bigint unsigned NOT NULL,
  `key` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prefix` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  PRIMARY KEY (`lang_code`,`slugs_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.slugs_translations: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.tags
CREATE TABLE IF NOT EXISTS `tags` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `author_id` bigint unsigned DEFAULT NULL,
  `author_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.tags: ~8 rows (lebih kurang)
INSERT INTO `tags` (`id`, `name`, `author_id`, `author_type`, `description`, `status`, `created_at`, `updated_at`) VALUES
	(1, 'Botble CMS', 1, 'Botble\\ACL\\Models\\User', NULL, 'published', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(2, 'JavaScript', 1, 'Botble\\ACL\\Models\\User', NULL, 'published', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(3, 'Open Source', 1, 'Botble\\ACL\\Models\\User', NULL, 'published', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(4, 'Web Design', 1, 'Botble\\ACL\\Models\\User', NULL, 'published', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(5, 'API Development', 1, 'Botble\\ACL\\Models\\User', NULL, 'published', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(6, 'Full Stack Development', 1, 'Botble\\ACL\\Models\\User', NULL, 'published', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(7, 'Vietnam Developer', 1, 'Botble\\ACL\\Models\\User', NULL, 'published', '2025-09-11 19:44:28', '2025-09-11 19:44:28'),
	(8, 'GitHub Projects', 1, 'Botble\\ACL\\Models\\User', NULL, 'published', '2025-09-11 19:44:28', '2025-09-11 19:44:28');

-- membuang struktur untuk table ucuy.tags_translations
CREATE TABLE IF NOT EXISTS `tags_translations` (
  `lang_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tags_id` bigint unsigned NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`lang_code`,`tags_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.tags_translations: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.testimonials
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.testimonials: ~4 rows (lebih kurang)
INSERT INTO `testimonials` (`id`, `name`, `content`, `image`, `company`, `status`, `created_at`, `updated_at`) VALUES
	(1, 'Jennifer Lee', '“Working with this team was an absolute pleasure. Their attention to detail, professionalism, and understanding of my needs made the entire home buying process stress-free and enjoyable.”', 'main/avatars/1.png', 'Happy Home Seeker', 'published', '2025-09-11 19:44:29', '2025-09-11 19:44:29'),
	(2, 'Robert Evans', '“The guidance and insights provided by this team were invaluable in helping me secure profitable investments. Their market knowledge and dedication to client success are unmatched.”', 'main/avatars/1.png', 'Property Investor', 'published', '2025-09-11 19:44:29', '2025-09-11 19:44:29'),
	(3, 'Jessica White', '“I couldn’t have asked for a smoother selling experience. Their expert advice, flawless staging, and negotiation skills resulted in a quick sale at a great price. Truly impressive!”', 'main/avatars/1.png', 'Delighted Home Seller', 'published', '2025-09-11 19:44:29', '2025-09-11 19:44:29'),
	(4, 'Daniel Miller', '“From start to finish, the home buying experience was handled with care and professionalism. The team listened to all my concerns and helped me find the perfect home in no time.”', 'main/avatars/1.png', 'Happy New Homeowner', 'published', '2025-09-11 19:44:29', '2025-09-11 19:44:29');

-- membuang struktur untuk table ucuy.testimonials_translations
CREATE TABLE IF NOT EXISTS `testimonials_translations` (
  `lang_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `testimonials_id` bigint unsigned NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `company` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`lang_code`,`testimonials_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.testimonials_translations: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.user_meta
CREATE TABLE IF NOT EXISTS `user_meta` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_meta_user_id_index` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.user_meta: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.user_settings
CREATE TABLE IF NOT EXISTS `user_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `key` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` json NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_settings_user_type_user_id_key_unique` (`user_type`,`user_id`,`key`),
  KEY `user_settings_user_type_user_id_index` (`user_type`,`user_id`),
  KEY `user_settings_key_index` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.user_settings: ~0 rows (lebih kurang)

-- membuang struktur untuk table ucuy.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remember_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `first_name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_id` bigint unsigned DEFAULT NULL,
  `super_user` tinyint(1) NOT NULL DEFAULT '0',
  `manage_supers` tinyint(1) NOT NULL DEFAULT '0',
  `permissions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `last_login` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_username_unique` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.users: ~1 rows (lebih kurang)
INSERT INTO `users` (`id`, `email`, `phone`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`, `first_name`, `last_name`, `username`, `avatar_id`, `super_user`, `manage_supers`, `permissions`, `last_login`) VALUES
	(1, 'mahalbangetid@gmail.com', NULL, NULL, '$2y$12$h7p7Eg/Kkv4BbsqYXyjvleFp23CHY4gjZRNI10DT/ywwaQ5v1fuCC', 'duNTx5o0k0fb9xmmNJjyXMkhiKnWkQ5XI70x0B2Fo01ADpdKUkOpU98lMDnj', '2025-11-26 08:19:29', '2025-12-31 06:08:25', 'Yusuf', 'Efendi', 'ucuy012', NULL, 1, 1, NULL, '2025-12-31 06:08:25');

-- membuang struktur untuk table ucuy.widgets
CREATE TABLE IF NOT EXISTS `widgets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `widget_id` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sidebar_id` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `theme` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` tinyint unsigned NOT NULL DEFAULT '0',
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membuang data untuk tabel ucuy.widgets: ~6 rows (lebih kurang)
INSERT INTO `widgets` (`id`, `widget_id`, `sidebar_id`, `theme`, `position`, `data`, `created_at`, `updated_at`) VALUES
	(1, 'ContactInformationWidget', 'sidebar_panel_sidebar', 'zelio', 1, '{"bio":"I\'m always excited to take on new projects and collaborate with innovative minds.","details":{"Phone":[{"key":"label","value":"Phone"},{"key":"value","value":"+1 234 567 890"}],"Email":[{"key":"label","value":"Email"},{"key":"value","value":"contact@botble.com"}],"Website":[{"key":"label","value":"Website"},{"key":"value","value":"https:\\/\\/botble.com"}],"Address":[{"key":"label","value":"Address"},{"key":"value","value":"123 Main Street, New York, NY 10001"}]}}', '2025-09-11 19:44:37', '2025-09-11 19:44:37'),
	(2, 'SocialLinkWidget', 'sidebar_panel_sidebar', 'zelio', 2, '{"name":"Social"}', '2025-09-11 19:44:37', '2025-09-11 19:44:37'),
	(3, 'LanguageSwitcherWidget', 'sidebar_panel_sidebar', 'zelio', 3, '[]', '2025-09-11 19:44:37', '2025-09-11 19:44:37'),
	(4, 'SiteLogoWidget', 'footer_sidebar', 'zelio', 1, '[]', '2025-09-11 19:44:37', '2025-09-11 19:44:37'),
	(5, 'SocialLinkWidget', 'footer_sidebar', 'zelio', 2, '{"name":"Social"}', '2025-09-11 19:44:37', '2025-09-11 19:44:37'),
	(6, 'Botble\\Widget\\Widgets\\CoreSimpleMenu', 'footer_sidebar', 'zelio', 3, '{"id":"Botble\\\\Widget\\\\Widgets\\\\CoreSimpleMenu","items":[[{"key":"label","value":"Home"},{"key":"url","value":"http:\\/\\/zelio.test\\/home"}],[{"key":"label","value":"Services"},{"key":"url","value":"http:\\/\\/zelio.test\\/services"}],[{"key":"label","value":"Pricing"},{"key":"url","value":"http:\\/\\/zelio.test\\/pricing"}],[{"key":"label","value":"Blog"},{"key":"url","value":"http:\\/\\/zelio.test\\/blog"}],[{"key":"label","value":"Contact"},{"key":"url","value":"http:\\/\\/zelio.test\\/contact"}]]}', '2025-09-11 19:44:37', '2025-09-11 19:44:37');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
