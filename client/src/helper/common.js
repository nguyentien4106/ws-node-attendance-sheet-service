export const getServerIp = () => localStorage.getItem("server-ip")

export const setServerIp = value => localStorage.setItem("server-ip", value)

export const getHostUrl = () => `ws://${getServerIp() ?? "127.0.0.1"}:3002`

export const getAPIUrl = () => `http://${getServerIp()}:3002`

export const isAuth = sessionStorage.getItem("auth") != null  ? true : false

const adminAccount = 'mcc.sanabox@gmail.com'

export const isAdmin = isAuth && sessionStorage.getItem("auth") === adminAccount 


export async function copyToClipboard(textToCopy) {
    // Navigator clipboard api needs a secure context (https)
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
    } else {
        // Use the 'out of viewport hidden text area' trick
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
            
        // Move textarea out of the viewport so it's not visible
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
            
        document.body.prepend(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
        } catch (error) {
            console.error(error);
        } finally {
            textArea.remove();
        }
    }
}