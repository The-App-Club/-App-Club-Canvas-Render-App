import cv2
#opencvはwebp非対応
image = cv2.imread("png/kitty.png")
gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
cv2.imwrite("png/kitty-gray.png", gray_image)
inverted_image = 255 - gray_image
cv2.imwrite("png/kitty-inverted.png", inverted_image)
blurred = cv2.GaussianBlur(inverted_image, (21, 21), 0)
cv2.imwrite("png/kitty-blurred.png", blurred)
inverted_blurred = 255 - blurred
pencil_sketch = cv2.divide(gray_image, inverted_blurred, scale=256.0)
cv2.imwrite("png/kitty-sketch.png", pencil_sketch)
