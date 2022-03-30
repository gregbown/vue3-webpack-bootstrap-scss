#!'/C/Program Files/Git/bin/bash'

## Self Signing for local use only
UNAMEOUT="$(uname -s)"
MACHINE="Failed OS inspection"
FULL_PATH=$(realpath $0)
TEMP_PATH=$(dirname $FULL_PATH)
DIR_PATH=/C${TEMP_PATH:2}
SUBJ="//SKIP=y/C=US/ST=CA/L=SD/O=Vanilla/OU=Vanilla/CN=Vanilla/FN=Vanilla/emailAddress=username@gmail.com"

## Check for OS
function check_os {
    case "${UNAMEOUT}" in
        Linux*)     MACHINE="Linux";;
        Darwin*)    MACHINE="Mac";;
        CYGWIN*)    MACHINE="Windows";;
        MINGW*)     MACHINE="Windows";;
        *)          MACHINE="UNKNOWN:${UNAMEOUT}"
    esac
    echo "Running on ${MACHINE}"
}

## Create private key, could also use pass:foobar unsure why absolute path does not work
function create_private_key {
	openssl genrsa -aes256 -passout file:'./vault/passphrase.txt' -out "${DIR_PATH}/vault/private/CArootkey.pem" 4096
}

## Remove passphrase from the key, could also use pass:foobar
function remove_passphrase {
	openssl rsa -in "${DIR_PATH}/vault/private/CArootkey.pem" -passin file:'./vault/passphrase.txt' -out "${DIR_PATH}/vault/private/CArootkey.pem"
}

## Create root CA certificate .pem -purpose
function create_root_ca {
	openssl req -x509 -new -nodes -key "${DIR_PATH}/vault/private/CArootkey.pem" -sha384 -days 3650 -out "${DIR_PATH}/vault/public/CArootcert.pem" -subj $SUBJ
}

## Create .csr Certificate Signing Request and a local server private key
function signing_request_private_key {
	openssl req -new -sha384 -nodes -out "${DIR_PATH}/vault/csr/server.csr" -newkey rsa:4096 -keyout "${DIR_PATH}/vault/private/server.key" -config "${DIR_PATH}/vault/server.csr.cnf"
}

## Create .crt signed with root for all domains in v3.ext using the .csr
function sign_cert {
	openssl x509 -req -in "${DIR_PATH}/vault/csr/server.csr" -CA "${DIR_PATH}/vault/public/CArootcert.pem" -CAkey "${DIR_PATH}/vault/private/CArootkey.pem" -CAcreateserial -out "${DIR_PATH}/vault/public/server.crt" -days 3650 -sha384 -extfile "${DIR_PATH}/vault/v3.ext"
}

## Verify the new cert
function verify_cert {
	openssl x509 -text -in "${DIR_PATH}/vault/public/server.crt" -noout
}

## Then install CArootcert.pem WINDOWS -> RUN -> MMC -> ADD -> CERTIFICATES -> TRUSTED ROOT -ADD
## certutil [options] -delstore certificatestorename certID
## Or provided you are running as admin
function install_ca_root {
	certutil -addstore -f "ROOT" "${DIR_PATH}/vault/public/CArootcert.pem"
}

## deployment requires all these
function create_new {
    echo -e 'Self Signing Vanilla cert for local use only'
    create_private_key
    remove_passphrase
    create_root_ca
    signing_request_private_key
    sign_cert
    verify_cert
    install_ca_root
}

## Delete the root ca.  Note: could add else case for mac os
function delete_existing_root_ca {
    if [ $MACHINE = "Windows" ]
    then
        echo "Remove existing root ca"
        certutil -delstore "ROOT" "Vanilla"
    fi
}

function clean_up_files {
    if test -f "./vault/csr/server.csr";then rm ./vault/csr/*; fi
    if test -f "./vault/private/CArootkey.pem";then rm ./vault/private/*; fi
    if test -f "./vault/public/CArootcert.pem";then rm ./vault/public/*; fi
}

function check_root_ca_exists {
    if test -f "./vault/public/CArootcert.pem";
    then
        ## Return is "SHA1 Fingerprint=2A:FE:D4:40:D2:23:78:6B:4E:88:19:EE:AE:FD:6B:11:49:46:F1:6D" so it must be scrubbed
        ## certutil -v -store ROOT $(openssl x509 -in "./vault/public/CArootcert.pem" -fingerprint -noout | sed -e 's/SHA1 Fingerprint=//' -e 's/://g' -e 's/\(.*\)/\L\1/')
        if [ certutil -v -store ROOT $(openssl x509 -in "./vault/public/CArootcert.pem" -fingerprint -noout | sed -e 's/SHA1 Fingerprint=//' -e 's/://g' -e 's/\(.*\)/\L\1/') ]
        then
            echo -e "Found root ca Vanilla\nRemoving cert and related files"
            delete_existing_root_ca
            clean_up_files
        else
            echo -e "Root ca Vanilla not found\nAssume cert was removed\nRemoving related files"
            clean_up_files
        fi
    else
        echo -e "No pem file is available to look up fingerprint\nAssume cert has been removed or was not created\nDeploy stack..."
        clean_up_files
    fi
}


check_os
check_root_ca_exists
create_new

