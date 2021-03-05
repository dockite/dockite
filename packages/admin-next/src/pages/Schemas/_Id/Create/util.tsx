import { Router } from 'vue-router';

export const getHeaderActions = (createDocumentHandler: () => any): JSX.Element => {
  return (
    <el-dropdown splitButton onClick={() => createDocumentHandler()}>
      {{
        default: () => <span>Create and Publish</span>,

        dropdown: () => (
          <el-dropdown-menu>
            <el-dropdown-item>Something</el-dropdown-item>
          </el-dropdown-menu>
        ),
      }}
    </el-dropdown>
  );
};

export const getFooter = (router: Router): JSX.Element => {
  return (
    <div class="pt-3">
      <el-button type="text" onClick={() => router.back()}>
        Go Back
      </el-button>
    </div>
  );
};
