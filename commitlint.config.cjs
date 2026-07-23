module.exports = {
    extends: ["@commitlint/config-conventional"],
    rules: {
        /* Corpo livre — commits podem conter trailers e descrições longas */
        "body-max-line-length": [0, "always"],
    },
};
