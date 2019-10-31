#!/bin/bash -e

APP_DIR=${APP_DIR:-/home/vagrant/synd}
DB_DIR=${DB_DIR:-${APP_DIR}/database/migrations/}

set -a
LOG=${LOG:-${APP_DIR}/vagrant/tmp/log/boot.log}
set +a

NODE_VER=${NODE_VER:-12.x}

PGVERSION=${PGVERSION:-12}
PGDATABASE=${PGDATABASE:-synd_test}
PGPORT=${PGPORT:-5432}
PGUSER=${PGUSER:-postgres}
PGPASSWORD=${PGPASSWORD:-devved}
SYNDPASSWORD=${SYNDPASSWORD:-synd_dev}

echo "starting provisioning..."
echo "NODE_VER: ${NODE_VER}"
echo "PGVERSION: ${PGVERSION}"
echo "PGDATABASE: ${PGDATABASE}"
echo "PGPORT: ${PGPORT}"
echo "PGUSER: ${PGUSER}"
echo "PGPASSWORD: ${PGPASSWORD}"

ETH0IP=$(ifconfig -a eth0 | grep "inet addr:")

mkdir -p /vagrant/tmp/log

print_db_usage () {
  echo "Your Postgres environment has been setup"
  echo "Networking: [ $ETH0IP ]"
  echo ""
  echo "  Port: $PGPORT"
  echo "  Database: $PGDATABASE"
  echo "  Username: $PGUSER"
  echo "  Password: $PGPASSWORD"
  echo ""
  echo "psql access to app database user via VM:"
  echo "  vagrant ssh"
  echo "  sudo su - postgres"
  echo "  PGUSER=$PGUSER PGPASSWORD=$PGPASSWORD psql -h localhost $PGDATABASE"
  echo ""
  echo "Env variable for application development:"
  echo "  DATABASE_URL=postgresql://$PGUSER:$PGPASSWORD@*:$PGPORT/$PGDATABASE"
  echo ""
  echo "Local command to access the database via psql:"
  echo "  PGUSER=$PGUSER PGPASSWORD=$PGPASSWORD psql -h localhost -p $PGPORT $PGDATABASE"
  echo ""
  echo "  Getting into the box (terminal):"
  echo "  vagrant ssh"
  echo "  sudo su - postgres"
  echo ""
}

export DEBIAN_FRONTEND=noninteractive


display() {
	echo -e "\n-----> "$0": "$*
}

PROVISIONED_ON=/etc/vm_provision_on_timestamp
if [ -f "$PROVISIONED_ON" ]
then
  echo "VM was already provisioned at: $(cat $PROVISIONED_ON)"
  echo "To run system updates manually login via 'vagrant ssh' and run 'apt-get update && apt-get upgrade'"
  echo ""
  print_db_usage
  exit
fi

display add postgresql apt sources

# Add PostgreSQL Apt repository to get latest stable
PG_REPO_APT_SOURCE=/etc/apt/sources.list.d/pgdg.list
if [ ! -f "$PG_REPO_APT_SOURCE" ]
then
	echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > "$PG_REPO_APT_SOURCE"
  #echo "deb http://security.ubuntu.com/ubuntu xenial-security main" > "$PG_REPO_APT_SOURCE"
	wget --quiet -O - http://apt.postgresql.org/pub/repos/apt/ACCC4CF8.asc | sudo apt-key add -
fi


display update apt packages
apt-get update

display install node
#apt-get -y install curl
apt-get -y install build-essential
curl -sL "https://deb.nodesource.com/setup_$NODE_VER" | sudo -E bash -


display "install node version ${NODE_VER}"
sudo apt-get install -y nodejs

display Install jq
apt-get -y install jq

display install openssl dependency
apt-get -y install libssl-dev

# Install PostgreSQL
echo "install postgresql version ${PGVERSION}"
# -qq implies -y --force-yes
#sudo apt-get install -qq "postgresql-$PGVERSION" "postgresql-contrib-$PGVERSION"
# Install dev version of postgresql to support debugging
apt-get -qq install "postgresql-server-dev-$PGVERSION" "postgresql-contrib-$PGVERSION"

# Configure PostgreSQL
# Listen for localhost connections
PG_CONF="/etc/postgresql/$PGVERSION/main/postgresql.conf"
PG_HBA="/etc/postgresql/$PGVERSION/main/pg_hba.conf"


pg_ctlcluster ${PGVERSION} main restart

# Give root pg superuser for compilation of extensions
cat << EOF | su - postgres -c psql
CREATE USER root WITH SUPERUSER;
EOF
echo "local    all    root    peer" >> "$PG_HBA"
pg_ctlcluster ${PGVERSION} main reload


# Install is_jsonb_valid and pgjwt extension
cd ~
set -e
git clone https://github.com/furstenheim/is_jsonb_valid || true
git clone https://github.com/michelp/pgjwt || true
set +e
cd is_jsonb_valid
make install
cd ..
cd pgjwt
make install
cd ..

# update postgres user password
cat << EOF | su - postgres -c psql
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION PASSWORD '$PGPASSWORD';
EOF

# add synd user
cat << EOF | su - postgres -c psql
CREATE ROLE synd WITH LOGIN PASSWORD '$SYNDPASSWORD';
EOF

# Edit postgresql.conf to change listen address to '*':
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"


# Edit postgresql.conf to change port:
if [ ! -z "$PGPORT" ]
then
	sed -i "/port = /c\port = $PGPORT" "$PG_CONF"
fi


# Append to pg_hba.conf to add password auth:
echo "host    all    all    all    md5" >> "$PG_HBA"

# Restart PostgreSQL for good measure
service postgresql restart

# Install pldebugger
sudo apt-get install -y openssl libkrb5-dev git-core

# Repo: https://sqldesign.blog/2018/12/25/how-to-install-the-pl-pgsql-debugger/
sudo su
cd /usr/lib/postgresql/12/lib
mkdir -p contrib/src
cd contrib/src
git clone git://git.postgresql.org/git/pldebugger.git
cd pldebugger
export USE_PGXS=1
make
make install

export PGDATA=/var/lib/postgresql/12/main
export PATH=$PATH:/usr/lib/postgresql/12/bin

sed -i "s/#shared_preload_libraries = ''/shared_preload_libraries = 'plugin_debugger'/" "$PG_CONF"

pg_ctlcluster ${PGVERSION} main restart

# create test db
cat << EOF | su - postgres -c psql
-- Create extensions:
\connect template1
CREATE EXTENSION pldbgapi;
CREATE EXTENSION pgcrypto schema pg_catalog;
CREATE EXTENSION is_jsonb_valid schema pg_catalog CASCADE;
CREATE EXTENSION pgjwt schema pg_catalog;
-- Create the database:
CREATE DATABASE $PGDATABASE WITH OWNER $PGUSER TEMPLATE template1;
-- auto explain for analyse all queries and inside functions
LOAD 'auto_explain';
SET auto_explain.log_min_duration = 0;
SET auto_explain.log_analyze = true;
EOF


# Restart PostgreSQL for good measure
service postgresql restart

# Install Ansible for tests
apt-get install software-properties-common -y
apt-add-repository ppa:ansible/ansible
apt-get update
apt-get -qq install ansible -y


# TODO: iterate the deploy and import.json
display Load DDL and sample data
display find the deploy files at ${DB_DIR}
display list the files: $(find ${DB_DIR} -name '*.json' | sort)

echo "/* database/migrations/1/0/0/0deploy.sql */" > "${DB_DIR}1/0/0/0deploy.sql";
echo "BEGIN;" >> "${DB_DIR}1/0/0/0deploy.sql";
cat ${APP_DIR}/database/modules/public/1/0/0/*.sql >> "${DB_DIR}1/0/0/0deploy.sql";
echo "COMMIT;" >> "${DB_DIR}1/0/0/0deploy.sql";

for f in $(find -L ${DB_DIR} -name '*.sql' | sort); do
  echo $0 running $f;
  echo $f >> database.err;
  su - postgres -c "psql --port=$PGPORT --dbname=$PGDATABASE" < "$f" 2>> database.err && echo;
done;

# Configure /var/run folder
useradd -m -p ${SYNDPASSWORD} synd

# Install servermgr
cd ${APP_DIR}

npm install

# Tag the provision time:
date > "$PROVISIONED_ON"

echo "Successfully created postgres dev virtual machine with Postgres"
echo ""
print_db_usage
