import { LocalStorageHelper } from "@/api/helper/localStorage.helper";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  isLoggedIn: boolean;
  displayName: string | null;
  email: string | null;
  userId: string | null;
}

const initialState: UserState = {
  isLoggedIn: false,
  displayName: null,
  email: null,
  userId: null,
};

const persistedUser = localStorage.getItem("user");
const userFromStorage = persistedUser ? JSON.parse(persistedUser) : null;

const initialStateFromStorage = userFromStorage
  ? {
      isLoggedIn: true,
      displayName: userFromStorage.displayName,
      email: userFromStorage.email,
      userId: userFromStorage.userId,
    }
  : initialState;

interface LoginPayload {
  displayName: string;
  email: string;
  userId: string;
}

const userSlice = createSlice({
  name: "user",
  initialState: initialStateFromStorage,
  reducers: {
    login: (state, action: PayloadAction<LoginPayload>) => {
      state.isLoggedIn = true;
      state.displayName = action.payload.displayName;
      state.email = action.payload.email;
      state.userId = action.payload.userId;

      // Save to localStorage
      LocalStorageHelper.setUserInfo(
        action.payload.displayName,
        action.payload.email,
        action.payload.userId
      );
    },
    logout: (state) => {
      Object.assign(state, initialState);
      LocalStorageHelper.logoutUser();
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
