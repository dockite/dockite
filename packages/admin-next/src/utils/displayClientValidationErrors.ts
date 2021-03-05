import { ElMessage } from "element-plus";
import { FieldErrorList } from "~/common/types";

export const displayClientValidationErrors = (fieldErrors: FieldErrorList): void => {
  if (fieldErrors) {
    const errors = Object.values(fieldErrors).map(e => e[0].message);

    errors.slice(0, 4).forEach((message) => {
      setImmediate(() => {
        ElMessage.warning(message);
      });
    });

    if (errors.length > 4) {
      setImmediate(() => {
        ElMessage.warning(`And ${errors.length - 4} more validation errors`);
      });
    }
  }
};

export default displayClientValidationErrors;
