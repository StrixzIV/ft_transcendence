import vaultFactory from "node-vault";

export const vault = vaultFactory({
    apiVersion: "v1", // default
    endpoint: "http://vault:8200",
    token: process.env["VAULT_DEV_ROOT_TOKEN_ID"],
});
