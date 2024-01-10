# Directory Structure

:::tip
There is example directory structure.
Feel free to change it to your needs.  
Or even do everything in a single file.
:::

## Basic layout for backend app

```text
<PROJECT ROOT>
- src
    - modules
        - payment-module
            - index.ts
            - PaymentModule.ts
            - PaymentProcessService.ts
            - PaymentRequestService.ts
        - user-module
            - index.ts
            - UserModule.ts
            - UserService.ts
        - ... etc
    - types
        - vendor-lib1.d.ts
        - vendor-lib2.d.ts
        - ... etc
    - utils
        - strings.ts
        - crypto.ts
        - ... etc
    - container.ts
    - index.ts
- start.js
- package.json
- tsconfig.json
```

The whole point of this structure is to keep everything related to a single module in a single folder.
