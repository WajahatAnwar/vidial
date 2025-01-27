-- Adminer 4.7.8 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `plans`;
CREATE TABLE `plans` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(8,2) NOT NULL,
  `interval` varchar(255) DEFAULT NULL,
  `capped_amount` decimal(8,2) DEFAULT NULL,
  `terms` varchar(255) DEFAULT NULL,
  `trial_days` int(11) DEFAULT NULL,
  `test` tinyint(1) NOT NULL DEFAULT 0,
  `on_install` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `ugc_video_count` int(11) DEFAULT NULL,
  `ugc_email_count` int(11) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `plans` (`id`, `type`, `name`, `price`, `interval`, `capped_amount`, `terms`, `trial_days`, `test`, `on_install`, `created_at`, `updated_at`, `ugc_video_count`, `ugc_email_count`, `description`) VALUES
(4,	'RECURRING',	'10 Video Plan',	24.00,	NULL,	0.00,	'Terms',	0,	1,	0,	NULL,	NULL,	10,	4000,	'Collect up to 10 monthly UGC videos from your customers, to use for your Ads, Reviews and Social Networks.'),
(5,	'RECURRING',	'Standard',	49.00,	NULL,	0.00,	'Terms',	0,	1,	0,	NULL,	NULL,	50,	20000,	'Collect up to 50 monthly UGC videos from your customers, to use for your Ads, Reviews and Social Networks.'),
(6,	'RECURRING',	'100 Video Plan',	99.00,	NULL,	0.00,	'Terms',	0,	1,	0,	NULL,	NULL,	100,	100000,	'Collect up to 100 monthly UGC videos from your customers, to use for your Ads, Reviews and Social Networks.'),
(7,	'RECURRING',	'Free',	0.00,	NULL,	1.00,	'Terms',	0,	1,	1,	NULL,	NULL,	200,	200,	'Collect up to 1 monthly UGC videos from your customers, to use for your Ads, Reviews and Social Networks.'),
(8,	'RECURRING',	'200 Video Plan',	199.00,	NULL,	0.00,	'Terms',	0,	1,	0,	NULL,	NULL,	200,	200000,	'Collect up to 200 monthly UGC videos from your customers, to use for your Ads, Reviews and Social Networks.'),
(9,	'RECURRING',	'300 Video Plan',	299.00,	NULL,	0.00,	'Terms',	0,	1,	0,	NULL,	NULL,	300,	300000,	'Collect up to 300 monthly UGC videos from your customers, to use for your Ads, Reviews and Social Networks.'),
(10,	'RECURRING',	'400 Video Plan',	399.00,	NULL,	0.00,	'Terms',	0,	1,	0,	NULL,	NULL,	400,	400000,	'Collect up to 400 monthly UGC videos from your customers, to use for your Ads, Reviews and Social Networks.'),
(11,	'RECURRING',	'500 Video Plan',	499.00,	NULL,	0.00,	'Terms',	0,	1,	0,	NULL,	NULL,	500,	500000,	'Collect up to 500 monthly UGC videos from your customers, to use for your Ads, Reviews and Social Networks.'),
(12,	'RECURRING',	'Unlimited Video Plan',	599.00,	NULL,	0.00,	'Terms',	0,	1,	0,	NULL,	NULL,	500000,	600000,	'Collect unlimited monthly UGC videos from your customers, to use for your Ads, Reviews and Social Networks.'),
(13,	'RECURRING',	'Free',	0.00,	NULL,	1.00,	'Terms',	0,	1,	0,	NULL,	NULL,	1,	600000,	'Select this plan to keep your Landing Page and Approved Videos and come back later.'),
(14,	'RECURRING',	'Standard',	49.00,	NULL,	0.00,	'Terms',	0,	1,	0,	NULL,	NULL,	500000,	600000,	'Send emails from GoodAuthentic'),
(15,	'RECURRING',	'Premium',	199.00,	NULL,	0.00,	'Terms',	0,	1,	0,	NULL,	NULL,	500000,	600000,	'For brands that need premium intergratios'),
(16,	'RECURRING',	'Enterprise',	499.00,	NULL,	0.00,	'Terms',	0,	1,	0,	NULL,	NULL,	500000,	600000,	'For brands that need premium intergrations & services');

-- 2024-11-28 09:14:43
