packer {
  required_version = ">= 1.5.0"

  required_plugins {
    amazon = {
      version = ">= 1.0.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

# Variable definitions
variable "aws_profile" {
  type = string
}

variable "aws_region" {
  description = "AWS region where the AMI will be created"
  type        = string
}

variable "aws_instance_type" {
  description = "Instance type to use for building the AMI"
  type        = string
}

variable "aws_source_ami" {
  description = "Source AMI to use for building the custom image"
  type        = string
}

variable "aws_ami_name" {
  description = "Name of the AMI to create"
  type        = string
}

variable "aws_vpc_id" {
  description = "VPC ID where the build instance will run"
  type        = string
}

variable "aws_subnet_id" {
  description = "Subnet ID within the VPC where the build instance will run"
  type        = string
}

variable "volume_size" {
  description = "Size of the root volume in GB"
  type        = number
}

variable "artifact_path" {
  description = "Path to the application artifact (e.g., webapp.zip) to be copied into the AMI"
  type        = string
}

variable "service_name" {
  description = "Name of the systemd service"
  type        = string
  default     = "myapp"
}

# Source block for AWS AMI creation
source "amazon-ebs" "ubuntu" {
  profile       = var.aws_profile
  region        = var.aws_region
  ami_name      = "${var.aws_ami_name}-${formatdate("2006-01-02-15-04-05", timestamp())}-${uuidv4()}"
  instance_type = var.aws_instance_type
  vpc_id        = var.aws_vpc_id
  subnet_id     = var.aws_subnet_id

  source_ami_filter {
    filters = {
      name                = "ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["099720109477"] # Canonical ID for Ubuntu
  }

  ssh_username = "ubuntu"

  ami_block_device_mappings {
    device_name           = "/dev/sda1"
    volume_size           = var.volume_size
    delete_on_termination = true
    volume_type           = "gp2"
  }
}

# Build block with provisioners for setting up PostgreSQL, creating a user, copying artifacts, and setting up the systemd service
build {
  sources = ["source.amazon-ebs.ubuntu"]

  # Copy the service file
  provisioner "file" {
    source      = "./csye6225.service"
    destination = "/tmp/csye6225.service"
  }

  # Copy the application zip
  provisioner "file" {
    source      = "./webapp.zip"
    destination = "/tmp/webapp.zip"
  }


  # Run Node.js setup script
  provisioner "shell" {
    script = "./Nodejs.sh"
  }
}
