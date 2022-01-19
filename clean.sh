#!'/C/Program Files/Git/bin/bash'

UNAMEOUT="$(uname -s)"
MACHINE="Failed OS inspection"

## Check for OS
function check_os {
    case "${UNAMEOUT}" in
        Linux*)     MACHINE="Linux";;
        Darwin*)    MACHINE="Mac";;
        CYGWIN*)    MACHINE="Windows";;
        MINGW*)     MACHINE="Windows";;
        *)          MACHINE="UNKNOWN:${UNAMEOUT}"
    esac
    echo ${MACHINE}
}

function check_root_ca_exists {
    if test -f "./vault/public/CArootcert.pem";
    then
        ## Return is "SHA1 Fingerprint=2A:FE:D4:40:D2:23:78:6B:4E:88:19:EE:AE:FD:6B:11:49:46:F1:6D" so it must be scrubbed
        certutil -v -store ROOT $(openssl x509 -in "./vault/public/CArootcert.pem" -fingerprint -noout | sed -e 's/SHA1 Fingerprint=//' -e 's/://g' -e 's/\(.*\)/\L\1/')
        if [ $? -eq 0 ]
        then
            echo "Found root ca Vanilla"
            delete_existing_root_ca
            clean_up_files
        else
            echo "Root ca Vanilla not found"
        fi
    else
        echo -e "No pem file is available to look up fingerprint\nAssume cert has been removed or was not created"
    fi
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
    rm ./vault/csr/*;
    rm ./vault/private/*;
    rm ./vault/public/*;
}

function clean_up_docker {
    docker stop $(docker ps -a -q)
    ##
    if [ $(docker ps -a -q --filter="name=lotro") ];
        then
            echo -e "Found lotro docker container\nCleaning up..."
            docker container rm lotro
            docker volume rm lotro-themes lotro-sites lotro-profiles lotro-modules lotro-sites-local lotro-assets
            ## docker volume rm $(docker volume ls -qf dangling=true)
        else
            echo "lotro docker container not found"
    fi

    if [[ "$(docker images -q kubernetes_lotro:latest)" ]];
        then
            echo -e "Found lotro docker image\nCleaning up..."
            docker rmi $(docker images -q kubernetes_lotro:latest)
        else
            echo "lotro docker image not found"
    fi
}

check_os
clean_up_docker
check_root_ca_exists
## delete_existing_root_ca
