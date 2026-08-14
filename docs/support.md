# Support

## Before opening an issue

Check the supported Grafana versions, validate the query result against the [data model](data-model.md), and compare the panel's field mappings with the returned data frame. Confirm that the data contains at least three distinct axes and finite numeric values.

## What to include

- SpiderGraph version and Grafana version
- Browser and operating system
- Installation method (local, self-managed, container, or Helm)
- Sanitized panel JSON and a minimal representative data frame
- Whether the input is wide or long and which reducer/domain options are selected
- Exact steps, expected result, actual result, and any diagnostics shown by the panel
- A screenshot or recording when the issue is visual or interactive

Remove credentials, tokens, customer data, and sensitive URLs before sharing. If the issue could expose a vulnerability, follow [SECURITY.md](../SECURITY.md) instead of filing a public issue.

## Support boundary

Community support covers reproducible plugin behavior, documentation, and contribution guidance. Grafana hosting, data-source availability, Kubernetes infrastructure, and third-party catalog review remain the responsibility of the relevant provider or operator.
