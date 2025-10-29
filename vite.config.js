import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- Click **"Commit changes"**

---

### **File 4: .gitignore**

- Create new file: `.gitignore`
- Copy this:
```
node_modules
dist
.DS_Store
