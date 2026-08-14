CREATE TABLE IF NOT EXISTS projects (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT NULL,
  color VARCHAR(20) NOT NULL DEFAULT '#354b73',
  logo_url VARCHAR(500) NULL,
  website_url VARCHAR(500) NULL,
  status ENUM('active', 'archived') NOT NULL DEFAULT 'active',
  platform_ids JSON NULL,
  members JSON NULL,
  created_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_projects_slug (slug),
  KEY idx_projects_status (status),
  KEY idx_projects_created_by (created_by)
);

CREATE TABLE IF NOT EXISTS social_channels (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  color VARCHAR(20) NOT NULL DEFAULT '#354b73',
  icon_key VARCHAR(50) NOT NULL,
  char_limit INT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_social_channels_slug (slug),
  KEY idx_social_channels_status (status),
  KEY idx_social_channels_sort_order (sort_order)
);

CREATE TABLE IF NOT EXISTS project_social_accounts (
  id INT NOT NULL AUTO_INCREMENT,
  project_id INT NOT NULL,
  channel_id INT NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  handle VARCHAR(255) NULL,
  profile_url VARCHAR(500) NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_project_social_accounts_project_id (project_id),
  KEY idx_project_social_accounts_channel_id (channel_id),
  KEY idx_project_social_accounts_status (status)
);

CREATE TABLE IF NOT EXISTS social_posts (
  id INT NOT NULL AUTO_INCREMENT,
  project_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  caption TEXT NULL,
  hashtags TEXT NULL,
  link_url VARCHAR(500) NULL,
  media JSON NULL,
  post_type VARCHAR(50) NULL,
  account_ids JSON NULL,
  scheduled_at DATETIME NOT NULL,
  status ENUM('idea', 'draft', 'scheduled', 'published', 'archived') NOT NULL DEFAULT 'idea',
  assigned_to INT NULL,
  blog_id INT NULL,
  campaign VARCHAR(150) NULL,
  published_at DATETIME NULL,
  live_url VARCHAR(500) NULL,
  notes TEXT NULL,
  created_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_social_posts_project_id (project_id),
  KEY idx_social_posts_scheduled_at (scheduled_at),
  KEY idx_social_posts_status (status),
  KEY idx_social_posts_assigned_to (assigned_to),
  KEY idx_social_posts_blog_id (blog_id)
);

INSERT INTO social_channels (name, slug, color, icon_key, char_limit, sort_order)
VALUES
  ('Instagram', 'instagram', '#e1306c', 'instagram', 2200, 1),
  ('Facebook', 'facebook', '#1877f2', 'facebook', 63206, 2),
  ('LinkedIn', 'linkedin', '#0a66c2', 'linkedin', 3000, 3),
  ('X', 'x', '#7f90a8', 'x', 280, 4),
  ('YouTube', 'youtube', '#ff0000', 'youtube', 5000, 5),
  ('Threads', 'threads', '#8fa0b6', 'threads', 500, 6),
  ('WhatsApp', 'whatsapp', '#25d366', 'whatsapp', 1024, 7),
  ('Pinterest', 'pinterest', '#e60023', 'pinterest', 500, 8),
  ('TikTok', 'tiktok', '#69c9d0', 'tiktok', 2200, 9),
  ('Reddit', 'reddit', '#ff4500', 'reddit', 40000, 10)
ON DUPLICATE KEY UPDATE name = VALUES(name);
