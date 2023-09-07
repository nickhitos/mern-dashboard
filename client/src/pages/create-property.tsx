import { useState } from "react";
import { useGetIdentity } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { FieldValues } from "react-hook-form";
import Form from "components/common/Form";

const CreateProperty = () => {
	const { data: user } = useGetIdentity<{ email: string }>();
	const [propertyImage, setPropertyImage] = useState({ name: "", url: "" });
	const {
		refineCore: { onFinish, formLoading },
		register,
		handleSubmit,
	} = useForm();

	const handleImageChange = (file: File) => {
		const reader = (readFile: File) =>
			new Promise<string>((resolve) => {
				const fileReader = new FileReader();
				fileReader.onload = () => resolve(fileReader.result as string);
				fileReader.readAsDataURL(readFile);
			});

		reader(file).then((result: string) =>
			setPropertyImage({ name: file?.name, url: result })
		);
	};

	const onFinishHandler = async (data: FieldValues) => {
		if (!propertyImage.name) return alert("Please upload an image");

		await onFinish({
			...data,
			photo: propertyImage.url,
			// TODO: Uncomment 
			// email: user?.email,
			email: "nickh@gmail.com",
		});
	};

	return (
		<Form
			type="Create"
			register={register}
			onFinish={onFinish}
			formLoading={formLoading}
			handleSubmit={handleSubmit}
			handleImageChange={handleImageChange}
			onFinishHandler={onFinishHandler}
			propertyImage={propertyImage}
		/>
	);
};

export default CreateProperty;
