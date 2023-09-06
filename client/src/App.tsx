import {
	AuthBindings,
	Authenticated,
	GitHubBanner,
	Refine,
} from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
	ErrorComponent,
	notificationProvider,
	RefineSnackbarProvider,
	// ThemedLayoutV2,
} from "@refinedev/mui";
import {
	AccountCircleOutlined,
	ChatBubbleOutline,
	PeopleAltOutlined,
	StarOutlineRounded,
	VillaOutlined,
} from "@mui/icons-material";
import DashboardIcon from "@mui/icons-material/Dashboard";

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import routerBindings, {
	CatchAllNavigate,
	DocumentTitleHandler,
	NavigateToResource,
	UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import dataProvider from "@refinedev/simple-rest";
import axios, { AxiosRequestConfig } from "axios";
import { CredentialResponse } from "interfaces/google";
import {
	Login,
	Home,
	Agents,
	MyProfile,
	PropertyDetails,
	AllProperties,
	CreateProperty,
	AgentProfile,
	EditProperty,
} from "pages";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { parseJwt } from "utils/parse-jwt";
import { Header } from "./components/header";
import { ColorModeContextProvider } from "./contexts/color-mode";

import { ThemedLayoutV2 } from "components/themedLayout";
import { ThemedHeaderV2 } from "components/themedLayout/header";
import { ThemedSiderV2 } from "components/themedLayout/sider";
import { ThemedTitleV2 } from "components/themedLayout/title";
import { MuiInferencer } from "@refinedev/inferencer/mui";

const axiosInstance = axios.create();
axiosInstance.interceptors.request.use((request: AxiosRequestConfig) => {
	const token = localStorage.getItem("token");
	if (request.headers) {
		request.headers["Authorization"] = `Bearer ${token}`;
	} else {
		request.headers = {
			Authorization: `Bearer ${token}`,
		};
	}

	return request;
});

function App() {
	const authProvider: AuthBindings = {
		login: async ({ credential }: CredentialResponse) => {
			const profileObj = credential ? parseJwt(credential) : null;

			// Save user to MongoDB
			if (profileObj) {
				const response = await fetch(
					"https://mern-dashboard-qj07.onrender.com/api/v1/users",
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							name: profileObj.name,
							email: profileObj.email,
							avatar: profileObj.picture,
						}),
					}
				);

				const data = await response.json();

				if (response.status === 200) {
					localStorage.setItem(
						"user",
						JSON.stringify({
							...profileObj,
							avatar: profileObj.picture,
							userid: data._id,
						})
					);
				} else {
					return Promise.reject();
				}
				localStorage.setItem("token", `${credential}`);

				return {
					success: true,
					redirectTo: "/",
				};
			}

			return {
				success: false,
			};
		},
		logout: async () => {
			const token = localStorage.getItem("token");

			if (token && typeof window !== "undefined") {
				localStorage.removeItem("token");
				localStorage.removeItem("user");
				axios.defaults.headers.common = {};
				window.google?.accounts.id.revoke(token, () => {
					return {};
				});
			}

			return {
				success: true,
				redirectTo: "/login",
			};
		},
		onError: async (error) => {
			console.error(error);
			return { error };
		},
		check: async () => {
			const token = localStorage.getItem("token");

			if (token) {
				return {
					authenticated: true,
				};
			}

			return {
				authenticated: false,
				error: {
					message: "Check failed",
					name: "Token not found",
				},
				logout: true,
				redirectTo: "/login",
			};
		},
		getPermissions: async () => null,
		getIdentity: async () => {
			const user = localStorage.getItem("user");
			if (user) {
				return JSON.parse(user);
			}

			return null;
		},
	};

	return (
		<BrowserRouter>
			<GitHubBanner />
			<RefineKbarProvider>
				<ColorModeContextProvider>
					<CssBaseline />
					<GlobalStyles
						styles={{ html: { WebkitFontSmoothing: "auto" } }}
					/>
					<RefineSnackbarProvider>
						<Refine
							dataProvider={dataProvider(
								"https://mern-dashboard-qj07.onrender.com/api/v1"
							)}
							notificationProvider={notificationProvider}
							routerProvider={routerBindings}
							authProvider={authProvider}
							resources={[
								{
									name: "dashboard",
									options: { label: "Dashboard" },
									list: "/dashboard",
									icon: <DashboardIcon />,
								},
								{
									name: "properties",
									list: "/properties",
									show: "/properties/show/:id",
									create: "/properties/create",
									edit: "/properties/edit/:id",
									icon: <VillaOutlined />,
								},
								{
									name: "agents",
									list: "/agents",
									show: "/agents/show/:id",
									icon: <PeopleAltOutlined />,
								},
								{
									name: "reviews",
									list: MuiInferencer, // TODO: Dummy resource
									icon: <StarOutlineRounded />,
								},
								{
									name: "messages",
									list: MuiInferencer, // TODO: Dummy resource
									icon: <ChatBubbleOutline />,
								},
								{
									name: "my-profile",
									options: { label: "My Profile" },
									list: "/my-profile",
									icon: <AccountCircleOutlined />,
								},
							]}
							options={{
								syncWithLocation: true,
								warnWhenUnsavedChanges: true,
								projectId: "OxQb0y-YkpZ8M-dRFIHS",
							}}
						>
							<Routes>
								<Route
									element={
										<Authenticated
											fallback={
												<CatchAllNavigate to="/login" />
											}
										>
											<ThemedLayoutV2
												Header={() => (
													<Header isSticky={true} />
												)}
												Sider={() => (
													<ThemedSiderV2
														Title={({
															collapsed,
														}) => (
															<ThemedTitleV2
																collapsed={
																	collapsed
																}
															/>
														)}
													/>
												)}
											>
												<Outlet />
											</ThemedLayoutV2>
										</Authenticated>
									}
								>
									<Route
										index
										element={
											<NavigateToResource resource="dashboard" />
										}
									/>
									<Route path="dashboard">
										<Route index element={<Home />} />
									</Route>
									<Route path="properties">
										<Route
											index
											element={<AllProperties />}
										/>
										<Route
											path="show/:id"
											element={<PropertyDetails />}
										/>
										<Route
											path="edit/:id"
											element={<EditProperty />}
										/>
										<Route
											path="create"
											element={<CreateProperty />}
										/>
									</Route>
									<Route path="agents">
										<Route index element={<Agents />} />
										<Route
											path="show/:id"
											element={<AgentProfile />}
										/>
									</Route>
									<Route path="my-profile">
										<Route index element={<MyProfile />} />
									</Route>
									<Route
										path="*"
										element={<ErrorComponent />}
									/>
								</Route>
								<Route
									element={
										<Authenticated fallback={<Outlet />}>
											<NavigateToResource />
										</Authenticated>
									}
								>
									<Route path="/login" element={<Login />} />
								</Route>
							</Routes>
							<RefineKbar />
							<UnsavedChangesNotifier />
							<DocumentTitleHandler />
						</Refine>
					</RefineSnackbarProvider>
				</ColorModeContextProvider>
			</RefineKbarProvider>
		</BrowserRouter>
	);
}

export default App;
