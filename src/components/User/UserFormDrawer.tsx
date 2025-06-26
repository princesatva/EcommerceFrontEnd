// components/UserDrawerForm.tsx
import { Drawer, Form, Input, Select, Button } from "antd";
import { useEffect } from "react";

interface UserDrawerFormProps {
  visible: boolean;
  mode: "add" | "edit";
  onClose: () => void;
  onSubmit: (values: any) => void;
  loading?: boolean;
  initialValues?: any;
}

const UserDrawerForm = ({
  visible,
  mode,
  onClose,
  onSubmit,
  loading,
  initialValues,
}: UserDrawerFormProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          isActive: initialValues.isActive ? "true" : "false",
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues, form]);

  const handleFinish = (values: any) => {
    if (mode === "edit") {
      values.id = initialValues.id;
    }
    values.isActive = values.isActive === "true";
    onSubmit(values);
  };

  return (
    <Drawer
      title={mode === "add" ? "Add New User" : "Edit User"}
      open={visible}
      onClose={onClose}
      width={400}
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={loading}
          >
            {mode === "add" ? "Add" : "Save"}
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="userName"
          label="Username"
          rules={[{ required: true, message: "Please enter username" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please enter email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input />
        </Form.Item>

        {mode === "add" && (
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter password" }]}
          >
            <Input.Password />
          </Form.Item>
        )}

        <Form.Item
          name="roleId"
          label="Role"
          rules={[{ required: true, message: "Please select role" }]}
        >
          <Select
            options={[
              { label: "Customer", value: 2 },
              { label: "Seller", value: 3 },
            ]}
          />
        </Form.Item>

        {mode === "edit" && (
          <Form.Item
            name="isActive"
            label="Status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select
              options={[
                { label: "Active", value: "true" },
                { label: "Inactive", value: "false" },
              ]}
            />
          </Form.Item>
        )}
      </Form>
    </Drawer>
  );
};

export default UserDrawerForm;
