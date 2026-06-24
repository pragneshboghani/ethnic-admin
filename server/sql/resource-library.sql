CREATE TABLE IF NOT EXISTS resource_groups (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_resource_groups_slug (slug),
  KEY idx_resource_groups_sort_order (sort_order),
  KEY idx_resource_groups_created_by (created_by)
);

CREATE TABLE IF NOT EXISTS resource_files (
  id INT NOT NULL AUTO_INCREMENT,
  group_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(255) NOT NULL,
  extension VARCHAR(20) NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_resource_files_group_id (group_id),
  KEY idx_resource_files_uploaded_by (uploaded_by),
  KEY idx_resource_files_title (title),
  KEY idx_resource_files_original_name (original_name)
);
